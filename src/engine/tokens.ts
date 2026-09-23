/**
 * Jetons remplacés selon le profil de l'apprenant (thaï) :
 *   {P} particule polie d'affirmation → ครับ / ค่ะ     ({p} khráp / khâ)
 *   {Q} particule polie de question   → ครับ / คะ      ({q} khráp / khá)
 *   {I} « je »                        → ผม / ฉัน       ({i} phǒm / chǎn)
 *   {N} / {n} prénom de l'apprenant
 *   {forme homme|forme femme}
 */
export type Gender = 'm' | 'f';

export interface TokenProfile {
  gender: Gender;
  name: string;
}

export function resolveTokens(s: string, p: TokenProfile): string {
  const f = p.gender === 'f';
  const name = p.name || '…';
  return String(s)
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_m, a, b) => (f ? b : a))
    .replace(/\{P\}/g, f ? 'ค่ะ' : 'ครับ')
    .replace(/\{Q\}/g, f ? 'คะ' : 'ครับ')
    .replace(/\{I\}/g, f ? 'ฉัน' : 'ผม')
    .replace(/\{N\}/g, name)
    .replace(/\{p\}/g, f ? 'khâ' : 'khráp')
    .replace(/\{q\}/g, f ? 'khá' : 'khráp')
    .replace(/\{i\}/g, f ? 'chǎn' : 'phǒm')
    .replace(/\{n\}/g, name);
}

/** Texte à envoyer à la synthèse vocale : jetons résolus, points de suspension retirés. */
export const speakable = (s: string, p: TokenProfile) => resolveTokens(s, p).replace(/\.\.\.|…/g, ' ').trim();

export const hasTokens = (s: string) => /\{[PQIN]\}/.test(s);
