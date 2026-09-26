/**
 * Clé d'un clip audio pré-généré : empreinte stable du texte thaï tel qu'il est envoyé à la synthèse
 * (jetons de politesse résolus, espaces normalisés). Partagée entre l'application et le script de génération.
 */
export const normalizeClipText = (s: string) => s.normalize('NFC').replace(/\.\.\.|…/g, ' ').replace(/\s+/g, ' ').trim();

/** FNV-1a 32 bits, deux graines → 16 caractères hexadécimaux. Suffisant pour quelques milliers de textes. */
export function clipKey(text: string): string {
  const t = normalizeClipText(text);
  const fnv = (seed: number) => {
    let h = seed >>> 0;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(16).padStart(8, '0');
  };
  return fnv(0x811c9dc5) + fnv(0x01000193);
}
