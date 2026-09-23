import { DIGITS, NUM_UNITS } from '@/content/th/numbers';

export interface ThaiNumber {
  thai: string;
  rom: string;
  digits: string; // en chiffres thaïs
}

/** Nombre → {thai, rom, digits}. Valable de 0 à 999 999 999. */
export function thaiNumber(n: number): ThaiNumber {
  n = Math.floor(Math.abs(n));
  const dg = String(n)
    .split('')
    .map((d) => DIGITS[+d][0])
    .join('');
  if (n === 0) return { thai: DIGITS[0][1], rom: DIGITS[0][2], digits: dg };
  const th: string[] = [], ro: string[] = [];
  function below(m: number, top: boolean) {
    let started = !top;
    for (const [v, t, r] of NUM_UNITS.slice(1)) {
      const d = Math.floor(m / v);
      m %= v;
      if (!d) continue;
      if (v === 10) {
        if (d === 2) { th.push('ยี่'); ro.push('yîi'); }
        else if (d > 1) { th.push(DIGITS[d][1]); ro.push(DIGITS[d][2]); }
      } else { th.push(DIGITS[d][1]); ro.push(DIGITS[d][2]); }
      th.push(t); ro.push(r); started = true;
    }
    if (m) {
      if (m === 1 && started) { th.push('เอ็ด'); ro.push('èt'); }
      else { th.push(DIGITS[m][1]); ro.push(DIGITS[m][2]); }
    }
  }
  const mil = Math.floor(n / 1_000_000), rest = n % 1_000_000;
  if (mil) { below(mil, true); th.push('ล้าน'); ro.push('láan'); }
  if (rest) below(rest, !mil);
  return { thai: th.join(''), rom: ro.join('-'), digits: dg };
}

/** Chiffres arabes → chiffres thaïs. */
export const toThaiDigits = (s: string | number) => String(s).replace(/\d/g, (d) => DIGITS[+d][0]);
