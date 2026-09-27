// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { apply, disconnect, expired, IDLE_MS, info, newRoom, nextAlarm, parseClientMsg, parseQuiz, pointsFor, tick, view, type Room } from './game';
import { COUNTDOWN_MS, MAX_PLAYERS, REVEAL_MS, ROUND_MS, normalizeCode } from './protocol';

const QUIZ = '1abc~m2:a,b,c,d;t0:e,f,g,h;m3:i,j,k,l';
const ok = (o: ReturnType<typeof apply>) => { expect(o.error).toBeUndefined(); return o.room; };

function lobby(n = 2): Room {
  let r = newRoom('ABCDE', 0);
  for (let p = 0; p < n; p++) r = ok(apply(r, null, { t: 'join', id: `player${p}`, name: `P${p}` }, 10 + p));
  return r;
}
function started(): Room {
  let r = lobby();
  r = ok(apply(r, 'player0', { t: 'configure', code: QUIZ, label: 'Salutations' }, 100));
  r = ok(apply(r, 'player0', { t: 'start' }, 200));
  return tick(r, 200 + COUNTDOWN_MS);
}

describe('salle en ligne : règles', () => {
  it('lit une série codée comme un défi (bonnes réponses, nombre de choix)', () => {
    expect(parseQuiz(QUIZ)).toEqual({ keys: [2, 0, 3], sizes: [4, 4, 4] });
    expect(parseQuiz('1abc~m4:a,b,c,d')).toBeNull(); // bonne réponse hors des choix
    expect(parseQuiz('pas un code')).toBeNull();
    expect(parseQuiz('1abc~x1:a,b')).toBeNull();
  });

  it('le premier arrivé est l’hôte ; les noms en double sont numérotés', () => {
    let r = lobby();
    r = ok(apply(r, null, { t: 'join', id: 'player9', name: 'P0' }, 20));
    expect(r.hostId).toBe('player0');
    expect(r.players.map((p) => p.name)).toEqual(['P0', 'P1', 'P0 2']);
  });

  it('seul l’hôte règle et lance, à deux joueurs connectés au moins', () => {
    let r = lobby(1);
    expect(apply(r, 'player0', { t: 'start' }, 50).error?.code).toBe('bad-quiz');
    r = ok(apply(r, 'player0', { t: 'configure', code: QUIZ, label: 'x' }, 50));
    expect(apply(r, 'player0', { t: 'start' }, 60).error?.code).toBe('too-few');
    r = ok(apply(r, null, { t: 'join', id: 'player1', name: 'B' }, 70));
    expect(apply(r, 'player1', { t: 'start' }, 80).error?.code).toBe('not-host');
    expect(apply(r, 'player0', { t: 'configure', code: 'nimporte', label: '' }, 80).error?.code).toBe('bad-quiz');
    r = ok(apply(r, 'player0', { t: 'start' }, 90));
    expect(r.phase).toBe('countdown');
    expect(r.until).toBe(90 + COUNTDOWN_MS);
  });

  it('manche : points selon la justesse et la vitesse, révélation dès que tout le monde a répondu', () => {
    let r = started();
    const t0 = r.startedAt;
    expect(r.phase).toBe('question');
    r = ok(apply(r, 'player0', { t: 'answer', i: 0, k: 2, ms: 1000 }, t0 + 1200));
    expect(r.phase).toBe('question');
    expect(view(r, 'player1', t0).players.find((p) => p.id === 'player0')?.answered).toBe(true);
    expect(view(r, 'player1', t0).answers).toEqual([]); // rien n'est dévoilé pendant la manche
    r = ok(apply(r, 'player1', { t: 'answer', i: 0, k: 1, ms: 900 }, t0 + 1300));
    expect(r.phase).toBe('reveal');
    expect(r.players[0].score).toBe(pointsFor(true, 1000));
    expect(r.players[1].score).toBe(0);
    expect(view(r, 'player0', t0).answers).toHaveLength(2);
    // une seule réponse par manche, les réponses tardives sont ignorées
    expect(apply(r, 'player0', { t: 'answer', i: 0, k: 2, ms: 10 }, t0 + 1400).room).toBe(r);
  });

  it('le temps annoncé par l’appareil est borné par le temps réellement écoulé', () => {
    let r = started();
    const t0 = r.startedAt;
    r = ok(apply(r, 'player0', { t: 'answer', i: 0, k: 2, ms: 0 }, t0 + 9000)); // annonce 0 ms après 9 s
    expect(r.answers.player0.ms).toBe(9000 - 2500);
    r = ok(apply(r, 'player1', { t: 'answer', i: 0, k: 2, ms: 99999 }, t0 + 3000));
    expect(r.answers.player1.ms).toBe(3000);
  });

  it('sans réponse, la manche se termine au bout du temps ; la partie finit après la dernière question', () => {
    let r = started();
    r = tick(r, r.startedAt + ROUND_MS);
    expect(r.phase).toBe('reveal');
    r = tick(r, r.until); expect(r.phase).toBe('question'); expect(r.i).toBe(1);
    r = tick(r, r.until); r = tick(r, r.until); expect(r.i).toBe(2);
    r = tick(r, r.until); expect(r.phase).toBe('reveal');
    r = tick(r, r.until + REVEAL_MS); expect(r.phase).toBe('end');
    expect(r.until).toBe(0);
    // tick avant l'échéance : rien ne bouge
    const s = started();
    expect(tick(s, s.until - 1)).toBe(s);
  });

  it('un joueur qui part garde sa place ; l’hôte passe la main ; il peut revenir', () => {
    let r = started();
    r = disconnect(r, 'player0', r.startedAt + 10);
    expect(r.hostId).toBe('player1');
    // le seul joueur encore connecté répond : révélation immédiate
    r = ok(apply(r, 'player1', { t: 'answer', i: 0, k: 2, ms: 500 }, r.startedAt + 600));
    expect(r.phase).toBe('reveal');
    r = ok(apply(r, null, { t: 'join', id: 'player0', name: 'P0' }, r.startedAt + 700));
    expect(r.players.find((p) => p.id === 'player0')?.connected).toBe(true);
    expect(r.hostId).toBe('player1');
  });

  it('plus personne : la partie s’arrête et la salle s’efface après un délai', () => {
    let r = started();
    r = disconnect(disconnect(r, 'player0', 5000), 'player1', 5000);
    expect(r.phase).toBe('end');
    expect(nextAlarm(r)).toBe(5000 + IDLE_MS);
    expect(expired(r, 5000 + IDLE_MS - 1)).toBe(false);
    expect(expired(r, 5000 + IDLE_MS)).toBe(true);
  });

  it('salle pleine : 6 joueurs ; au salon, un absent laisse sa place', () => {
    let r = lobby(MAX_PLAYERS);
    expect(apply(r, null, { t: 'join', id: 'late-one', name: 'X' }, 99).error?.code).toBe('full');
    expect(info(r).full).toBe(true);
    r = disconnect(r, 'player3', 100);
    expect(info(r).full).toBe(false);
    r = ok(apply(r, null, { t: 'join', id: 'late-one', name: 'X' }, 101));
    expect(r.players).toHaveLength(MAX_PLAYERS);
  });

  it('revanche : les scores repartent de zéro', () => {
    let r = started();
    r = ok(apply(r, 'player0', { t: 'answer', i: 0, k: 2, ms: 100 }, r.startedAt + 100));
    for (let k = 0; k < 10; k++) r = tick(r, r.until || r.startedAt + ROUND_MS);
    expect(r.phase).toBe('end');
    r = ok(apply(r, 'player0', { t: 'start' }, 99999));
    expect(r.players.every((p) => p.score === 0)).toBe(true);
    expect(r.game).toBe(2);
  });

  it('messages reçus : lecture prudente, noms nettoyés', () => {
    expect(parseClientMsg('{"t":"answer","i":0,"k":1,"ms":300}')).toEqual({ t: 'answer', i: 0, k: 1, ms: 300 });
    expect(parseClientMsg('{"t":"hack"}')).toBeNull();
    expect(parseClientMsg('pas du json')).toBeNull();
    expect(parseClientMsg('x'.repeat(9000))).toBeNull();
    const r = ok(apply(newRoom('ABCDE', 0), null, { t: 'join', id: 'player0', name: '  <b>Léa</b>\n  la   grande qui a un nom très long ' }, 1));
    expect(r.players[0].name).toBe('bLéa/b la grande qui a u');
    expect(apply(r, null, { t: 'join', id: 'x', name: 'court' }, 2).error?.code).toBe('bad-msg');
  });

  it('code de salle : saisie libre ou lien collé', () => {
    expect(normalizeCode(' abc de ')).toBe('ABCDE');
    expect(normalizeCode('https://x.github.io/Langue/#/play/online/QWERT')).toBe('QWERT');
    expect(normalizeCode('ABCD')).toBe('');
    expect(normalizeCode('ABCDI')).toBe(''); // I n'existe pas dans les codes
  });
});
