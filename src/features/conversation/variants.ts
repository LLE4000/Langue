/**
 * Conversation parlée : autres formulations acceptées pour les répliques « Vous » des dialogues.
 * dialogue → index de la réplique → variantes (même sens, registre adapté). Jetons {P} {Q} {I} comme dans les dialogues.
 */
import type { Reply } from '@/engine/conversation';

export const REPLY_VARIANTS: Record<string, Record<number, Reply[]>> = {};
