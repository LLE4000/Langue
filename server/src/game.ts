/**
 * Règles d'une salle en ligne, sans dépendance à Cloudflare : un état + un événement + l'heure → nouvel état.
 * Le Durable Object (room.ts) ne fait que brancher ces fonctions sur les WebSockets, le stockage et l'alarme.
 *
 * Déroulé : salon (l'hôte règle la série) → compte à rebours → manche (15 s, ou dès que tout le monde a répondu)
 * → révélation (3 s) → manche suivante … → fin (podium). L'hôte peut relancer (revanche) ou revenir au salon.
 *
 * Points : bonne réponse = 10 + bonus de vitesse (5 → 0 sur la durée de la manche) ; mauvaise ou absente = 0.
 * Le temps compté est celui mesuré par l'appareil (équitable malgré la latence du réseau), borné par le temps
 * réellement écoulé côté serveur pour qu'un appareil ne puisse pas s'attribuer un temps impossible.
 *
 * Limite assumée : la série est connue de chaque appareil (elle contient la bonne réponse). C'est un jeu entre
 * personnes qui se connaissent, pas un concours : on ne cherche pas à empêcher la triche par les outils du navigateur.
 */
import {
  BASE_POINTS, COUNTDOWN_MS, MAX_PLAYERS, MAX_QUESTIONS, NAME_MAX, REVEAL_MS, ROUND_MS, SPEED_BONUS,
  type ClientMsg, type Phase, type RevealedAnswer, type RoomInfo, type RoomView, type ServerMsg,
} from './protocol';

export interface Player { id: string; name: string; score: number; connected: boolean; joinedAt: number }
export interface Answer { k: number; ms: number; ok: boolean; points: number }
export interface Room {
  code: string;
  createdAt: number;
  /** Dernière activité (message reçu ou connexion) : sert à effacer les salles abandonnées. */
  activeAt: number;
  hostId: string | null;
  phase: Phase;
  players: Player[];
  label: string;
  quiz: string;
  /** Bonne réponse de chaque question (rang dans les choix), tirée de la série codée. */
  keys: number[];
  /** Nombre de choix de chaque question. */
  sizes: number[];
  i: number;
  startedAt: number;
  until: number;
  answers: Record<string, Answer>;
  game: number;
}

export type ErrorCode = Extract<ServerMsg, { t: 'error' }>['code'];
export interface Outcome { room: Room; error?: { code: ErrorCode; msg: string } }

/** Une salle abandonnée (personne de connecté) est effacée après ce délai ; toute salle, au bout de MAX_AGE. */
export const IDLE_MS = 30 * 60_000;
export const MAX_AGE_MS = 12 * 3600_000;
/** Tolérance sur le temps annoncé par l'appareil (latence d'affichage et de réseau). */
const SLACK_MS = 2500;

export function newRoom(code: string, now: number): Room {
  return { code, createdAt: now, activeAt: now, hostId: null, phase: 'lobby', players: [], label: '', quiz: '', keys: [], sizes: [], i: 0, startedAt: 0, until: 0, answers: {}, game: 0 };
}

/**
 * Lit une série codée comme un défi : `<tête>~m2:a,b,c,d;t0:…[~…]`. Renvoie les bonnes réponses et le nombre de
 * choix de chaque question, ou null si le code est illisible. Le contenu (quels mots) n'intéresse pas le serveur.
 */
export function parseQuiz(code: string): { keys: number[]; sizes: number[] } | null {
  if (typeof code !== 'string' || code.length > 4000) return null;
  const [head, body] = code.split('~');
  if (!head || !body) return null;
  const keys: number[] = [], sizes: number[] = [];
  for (const q of body.split(';')) {
    const m = /^[mt](\d):([0-9a-z]+(?:,[0-9a-z]+)+)$/.exec(q);
    if (!m) return null;
    const size = m[2].split(',').length, k = Number(m[1]);
    if (k >= size || size > 8) return null;
    keys.push(k); sizes.push(size);
  }
  if (!keys.length || keys.length > MAX_QUESTIONS) return null;
  return { keys, sizes };
}

const clean = (s: unknown) => (typeof s === 'string' ? s.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX) : '');

/** Nom unique dans la salle : « Léa », « Léa 2 »… */
function uniqueName(room: Room, id: string, wanted: string): string {
  const base = wanted || 'Joueur';
  const taken = new Set(room.players.filter((p) => p.id !== id).map((p) => p.name.toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  for (let n = 2; ; n++) { const c = `${base.slice(0, NAME_MAX - 3)} ${n}`; if (!taken.has(c.toLowerCase())) return c; }
}

const connected = (room: Room) => room.players.filter((p) => p.connected);

/** L'hôte part : la main passe au joueur connecté arrivé le plus tôt. */
function fixHost(room: Room) {
  const host = room.players.find((p) => p.id === room.hostId);
  if (host?.connected) return;
  const next = connected(room).sort((a, b) => a.joinedAt - b.joinedAt)[0];
  room.hostId = next ? next.id : host ? host.id : null;
}

export function pointsFor(ok: boolean, ms: number): number {
  if (!ok) return 0;
  const left = Math.max(0, Math.min(1, 1 - ms / ROUND_MS));
  return BASE_POINTS + Math.round(SPEED_BONUS * left);
}

function startRound(room: Room, i: number, now: number) {
  room.phase = 'question'; room.i = i; room.answers = {}; room.startedAt = now; room.until = now + ROUND_MS;
}

function reveal(room: Room, now: number) {
  room.phase = 'reveal'; room.until = now + REVEAL_MS;
}

/** Tout le monde (connecté) a répondu ? Alors on révèle sans attendre la fin du temps. */
function maybeEarlyReveal(room: Room, now: number) {
  const live = connected(room);
  if (room.phase === 'question' && live.length && live.every((p) => room.answers[p.id])) reveal(room, now);
}

const err = (room: Room, code: ErrorCode, msg: string): Outcome => ({ room, error: { code, msg } });

/**
 * Applique un message d'un joueur. `from` est l'identifiant attaché à la connexion (null avant le « join »).
 * L'état est copié : l'appelant garde l'ancien si le message est refusé.
 */
export function apply(prev: Room, from: string | null, msg: ClientMsg, now: number): Outcome {
  const room: Room = structuredClone(prev);
  room.activeAt = now;
  if (msg.t === 'ping') return { room };
  if (msg.t === 'join') {
    const id = typeof msg.id === 'string' ? msg.id.slice(0, 64) : '';
    if (!/^[A-Za-z0-9_-]{6,64}$/.test(id)) return err(prev, 'bad-msg', 'Identifiant invalide.');
    const known = room.players.find((p) => p.id === id);
    if (known) {
      known.connected = true;
      known.name = uniqueName(room, id, clean(msg.name) || known.name);
    } else {
      // on remplace un joueur parti depuis la salle d'attente, jamais en pleine partie (son score compte)
      if (room.players.length >= MAX_PLAYERS && room.phase === 'lobby') room.players = room.players.filter((p) => p.connected);
      if (room.players.length >= MAX_PLAYERS) return err(prev, 'full', `La salle est pleine (${MAX_PLAYERS} joueurs).`);
      room.players.push({ id, name: uniqueName(room, id, clean(msg.name)), score: 0, connected: true, joinedAt: now });
    }
    if (!room.hostId) room.hostId = id;
    fixHost(room);
    return { room };
  }
  if (!from || !room.players.some((p) => p.id === from)) return err(prev, 'bad-msg', 'Présentez-vous d’abord.');
  const isHost = room.hostId === from;
  switch (msg.t) {
    case 'configure': {
      if (!isHost) return err(prev, 'not-host', 'Seul l’hôte règle la partie.');
      if (room.phase !== 'lobby' && room.phase !== 'end') return err(prev, 'phase', 'Une partie est en cours.');
      const parsed = parseQuiz(msg.code);
      if (!parsed) return err(prev, 'bad-quiz', 'Série de questions illisible.');
      room.quiz = msg.code; room.keys = parsed.keys; room.sizes = parsed.sizes; room.label = clean(msg.label).slice(0, 40);
      return { room };
    }
    case 'start': {
      if (!isHost) return err(prev, 'not-host', 'Seul l’hôte lance la partie.');
      if (room.phase !== 'lobby' && room.phase !== 'end') return err(prev, 'phase', 'Une partie est déjà en cours.');
      if (!room.keys.length) return err(prev, 'bad-quiz', 'Choisissez d’abord les mots du jeu.');
      if (connected(room).length < 2) return err(prev, 'too-few', 'Il faut au moins deux joueurs connectés.');
      room.players = room.players.filter((p) => p.connected);
      room.players.forEach((p) => (p.score = 0));
      room.game++; room.i = 0; room.answers = {};
      room.phase = 'countdown'; room.until = now + COUNTDOWN_MS;
      return { room };
    }
    case 'answer': {
      if (room.phase !== 'question' || msg.i !== room.i) return { room: prev }; // réponse tardive : ignorée sans erreur
      if (room.answers[from]) return { room: prev };
      const k = Number(msg.k);
      if (!Number.isInteger(k) || k < 0 || k >= room.sizes[room.i]) return err(prev, 'bad-msg', 'Réponse invalide.');
      const elapsed = now - room.startedAt;
      const claimed = Number.isFinite(msg.ms) ? Number(msg.ms) : elapsed;
      const ms = Math.round(Math.max(Math.max(0, elapsed - SLACK_MS), Math.min(claimed, elapsed)));
      const ok = k === room.keys[room.i];
      const points = pointsFor(ok, ms);
      room.answers[from] = { k, ms, ok, points };
      const p = room.players.find((x) => x.id === from)!;
      p.score += points;
      maybeEarlyReveal(room, now);
      return { room };
    }
    case 'lobby': {
      if (!isHost) return err(prev, 'not-host', 'Seul l’hôte peut revenir au salon.');
      room.phase = 'lobby'; room.until = 0; room.answers = {};
      return { room };
    }
    default:
      return err(prev, 'bad-msg', 'Message inconnu.');
  }
}

/** Une connexion se ferme (le joueur garde sa place et son score ; il peut revenir). */
export function disconnect(prev: Room, id: string, now: number): Room {
  const room: Room = structuredClone(prev);
  const p = room.players.find((x) => x.id === id);
  if (!p) return prev;
  p.connected = false;
  fixHost(room);
  maybeEarlyReveal(room, now);
  if (!connected(room).length && room.phase !== 'end') {
    // plus personne : la partie s'arrête, la salle attend (puis s'efface si personne ne revient)
    room.phase = room.game ? 'end' : 'lobby'; room.until = 0;
  }
  room.activeAt = now;
  return room;
}

/** L'heure d'une échéance est passée : compte à rebours → manche → révélation → manche suivante → fin. */
export function tick(prev: Room, now: number): Room {
  if (!prev.until || now < prev.until) return prev;
  const room: Room = structuredClone(prev);
  if (room.phase === 'countdown') startRound(room, 0, now);
  else if (room.phase === 'question') reveal(room, now);
  else if (room.phase === 'reveal') {
    if (room.i + 1 < room.keys.length) startRound(room, room.i + 1, now);
    else { room.phase = 'end'; room.until = 0; }
  }
  return room;
}

/** Prochaine échéance à programmer (alarme) : fin de phase, ou effacement d'une salle abandonnée. */
export function nextAlarm(room: Room): number {
  const expire = connected(room).length ? room.createdAt + MAX_AGE_MS : Math.min(room.activeAt + IDLE_MS, room.createdAt + MAX_AGE_MS);
  return room.until ? Math.min(room.until, expire) : expire;
}

export const expired = (room: Room, now: number) => now >= room.createdAt + MAX_AGE_MS || (!connected(room).length && now >= room.activeAt + IDLE_MS);

/** État public de la salle pour un joueur : les réponses de la manche ne sont dévoilées qu'à la révélation. */
export function view(room: Room, you: string, now: number): RoomView {
  const answers: RevealedAnswer[] = room.phase === 'reveal' ? Object.entries(room.answers).map(([id, a]) => ({ id, k: a.k, ok: a.ok, points: a.points, ms: a.ms })) : [];
  return {
    code: room.code, phase: room.phase, you, label: room.label, quiz: room.quiz, total: room.keys.length, i: room.i, now, until: room.until, answers, game: room.game,
    players: room.players.map((p) => ({ id: p.id, name: p.name, score: p.score, connected: p.connected, host: p.id === room.hostId, answered: room.phase === 'question' ? !!room.answers[p.id] : false })),
  };
}

export const info = (room: Room): RoomInfo => ({
  code: room.code, phase: room.phase, players: connected(room).length,
  // au salon, les places des absents se libèrent ; en partie, elles restent réservées
  full: room.phase === 'lobby' ? connected(room).length >= MAX_PLAYERS : room.players.length >= MAX_PLAYERS,
});

/** Lecture prudente d'un message reçu (JSON, taille bornée, champs attendus). */
export function parseClientMsg(raw: unknown): ClientMsg | null {
  if (typeof raw !== 'string' || raw.length > 8000) return null;
  let m: unknown;
  try { m = JSON.parse(raw); } catch { return null; }
  if (!m || typeof m !== 'object') return null;
  const o = m as Record<string, unknown>;
  switch (o.t) {
    case 'join': return typeof o.id === 'string' ? { t: 'join', id: o.id, name: typeof o.name === 'string' ? o.name : '' } : null;
    case 'configure': return typeof o.code === 'string' ? { t: 'configure', code: o.code, label: typeof o.label === 'string' ? o.label : '' } : null;
    case 'start': case 'lobby': case 'ping': return { t: o.t };
    case 'answer': return typeof o.i === 'number' && typeof o.k === 'number' ? { t: 'answer', i: o.i, k: o.k, ms: typeof o.ms === 'number' ? o.ms : NaN } : null;
    default: return null;
  }
}
