/**
 * Qui parle ? Genre de l'interlocuteur d'un dialogue, pour choisir la voix (homme / femme).
 * D'abord les particules de politesse de ses répliques (ค่ะ/คะ → femme, ครับ → homme), sinon le rôle en français.
 */
import type { Dialog } from '@/content/types';
import type { Gender } from './tokens';

const FEMALE_ROLE = /(euse|rice|ière|ienne|ante|ente|ère)$|^(amie|nouvelle|femme|mère|maman|sœur|fille|dame|madame)\b/i;
const MALE_ROLE = /(eur|ier|ien|ant|ent|er)$|^(ami|homme|père|papa|frère|garçon|monsieur)\b/i;

export function genderFromRole(role: string): Gender | null {
  const r = role.trim();
  if (!r) return null;
  if (FEMALE_ROLE.test(r)) return 'f';
  if (MALE_ROLE.test(r)) return 'm';
  return null;
}

export function dialogOtherGender(d: Pick<Dialog, 'lines' | 'other'> & { otherGender?: Gender }, fallback: Gender = 'f'): Gender {
  if (d.otherGender) return d.otherGender;
  let f = 0, m = 0;
  for (const l of d.lines) {
    if (l.who !== 'other') continue;
    if (/(ค่ะ|คะ|ค่า)(\s|$)/.test(l.thai)) f++;
    if (/(ครับ|คับ)(\s|$)/.test(l.thai)) m++;
  }
  if (f !== m) return f > m ? 'f' : 'm';
  return genderFromRole(d.other.fr) ?? fallback;
}
