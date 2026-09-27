/**
 * Protocole des salles en ligne, partagé par le serveur (Worker Cloudflare) et l'application.
 * Uniquement des types et des constantes : aucun import, pour que les deux côtés puissent l'utiliser tels quels.
 *
 * Une salle = un code de 5 lettres. L'hôte (le premier arrivé, ou le suivant s'il part) règle la série de questions
 * (codée comme un défi à distance : `version+signature~q1;q2;…`), puis lance la partie. Le serveur fait foi : il
 * cadence les manches, reçoit les réponses, compte les points et envoie à chacun l'état public de la salle.
 */

export const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sans I ni O (confondus avec 1 et 0 quand on dicte le code)
export const CODE_LENGTH = 5;
export const MAX_PLAYERS = 6;
export const MAX_QUESTIONS = 30;
export const NAME_MAX = 24;
export const COUNTDOWN_MS = 3000;
export const ROUND_MS = 15000;
export const REVEAL_MS = 3000;
/** Points d'une bonne réponse : une base, plus un bonus de vitesse (0 à SPEED_BONUS, dégressif sur la manche). */
export const BASE_POINTS = 10;
export const SPEED_BONUS = 5;

export type Phase = 'lobby' | 'countdown' | 'question' | 'reveal' | 'end';

/** Messages de l'application vers le serveur. */
export type ClientMsg =
  | { t: 'join'; id: string; name: string }
  | { t: 'configure'; code: string; label: string } // hôte : série codée comme un défi (voir quiz.ts)
  | { t: 'start' } // hôte
  | { t: 'answer'; i: number; k: number; ms: number } // k : rang du choix touché ; ms : temps de réponse mesuré par l'appareil
  | { t: 'lobby' } // hôte : revenir au salon (changer les mots)
  | { t: 'ping' };

export interface PublicPlayer { id: string; name: string; score: number; connected: boolean; host: boolean; answered: boolean }
/** Réponse révélée à la fin d'une manche. */
export interface RevealedAnswer { id: string; k: number; ok: boolean; points: number; ms: number }

/** État public de la salle, envoyé à chaque changement. */
export interface RoomView {
  code: string;
  phase: Phase;
  you: string;
  players: PublicPlayer[];
  label: string;
  /** Série codée (vide tant que l'hôte n'a rien réglé). */
  quiz: string;
  total: number;
  /** Manche en cours (0…total-1). */
  i: number;
  /** Heure serveur de l'envoi, pour recaler les horloges. */
  now: number;
  /** Fin du compte à rebours, de la manche ou de la révélation (heure serveur), sinon 0. */
  until: number;
  /** Réponses de la manche, révélées seulement en phase « reveal ». */
  answers: RevealedAnswer[];
  /** Nombre de parties jouées dans la salle (revanches). */
  game: number;
}

/** Messages du serveur vers l'application. */
export type ServerMsg =
  | { t: 'state'; room: RoomView }
  | { t: 'error'; code: 'full' | 'not-host' | 'bad-quiz' | 'bad-msg' | 'too-few' | 'phase' | 'gone'; msg: string }
  | { t: 'pong'; now: number };

/** Informations publiques d'une salle (avant de s'y connecter). */
export interface RoomInfo { code: string; phase: Phase; players: number; full: boolean }

/** Réponse du service de jetons Azure. */
export interface AzureToken { token: string; region: string; expiresAt: number }

/** Code saisi ou collé (lien complet, minuscules, espaces) → code de salle, ou chaîne vide. */
export function normalizeCode(s: string): string {
  const fromLink = /online\/([A-Za-z]{5})\b/.exec(s)?.[1];
  const c = (fromLink ?? s).toUpperCase().replace(/[^A-Z]/g, '');
  return isRoomCode(c) ? c : '';
}
export const isRoomCode = (s: string) => s.length === CODE_LENGTH && [...s].every((c) => CODE_LETTERS.includes(c));
