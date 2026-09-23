/**
 * Prérequis de lecture d'un mot thaï.
 *
 * `readingRequirements(mot)` renvoie l'ensemble des notions qu'il faut avoir apprises pour LIRE ce mot :
 *   - chaque consonne prononcée   → "c:ก"
 *   - chaque forme de voyelle     → "v:เ–า" (identifiants des voyelles du contenu)
 *   - chaque marque de ton        → "m:1" … "m:4"
 *   - consonne finale             → "rule:final-live" (น ม ง ย ว) · "rule:final-dead" (ก ด บ ต ป) · "rule:final-irregular" (autres)
 *   - ห นำ / อ นำ                 → "rule:hnam" / "rule:onam"
 *   - groupe consonantique        → "rule:cluster"
 *   - voyelle implicite           → "rule:implicit-o" (คน) · "rule:implicit-a" (สบาย)
 *   - ◌์ (lettre muette)          → "rule:karan"
 *   - ๆ, ฯ, chiffres thaïs        → "rule:maiyamok" · "rule:paiyan" · "rule:digits"
 * Une voyelle ou un signe non reconnu produit "ch:X" : un tel mot n'est jamais considéré lisible.
 *
 * L'analyse est heuristique (le thaï s'écrit sans espaces), volontairement prudente : en cas de doute,
 * on exige davantage, jamais moins.
 */

const TM = '[่้๊๋]?';
const CL = '(?:ห[งญนมยรลว]|อย|[กขค][รลว]|ตร|ป[รล]|ผล|พ[รล]|[บฟด]ร|[สศจซ]ร|[ก-ฮ])'; // ห นำ, อ นำ, groupes réels, consonne simple
const VS = 'ะัาำิีึืุูเแโใไ็ฤๅ';

interface Pat { id: string; re: RegExp }
const P = (id: string, src: string): Pat => ({ id, re: new RegExp(src, 'g') });

/** Motifs de voyelles, du plus long au plus court. Le groupe 1 capture la (les) consonne(s) initiale(s). */
const PATTERNS: Pat[] = [
  P('v:เ–ือ', `เ(${CL})ื${TM}อ`),
  P('v:เ–ีย', `เ(${CL})ี${TM}ย`),
  P('v:เ–าะ', `เ(${CL})${TM}าะ`),
  P('v:เ–อะ', `เ(${CL})${TM}อะ`),
  P('v:เ–ะ', `เ(${CL})${TM}ะ`),
  P('v:แ–ะ', `แ(${CL})${TM}ะ`),
  P('v:โ–ะ', `โ(${CL})${TM}ะ`),
  P('v:เ–า', `เ(${CL})${TM}า`),
  P('v:เ–ย', `เ(${CL})${TM}ย`),
  P('v:เ–อ', `เ(${CL})${TM}อ`),
  P('v:เ–อ', `เ(${CL})ิ`), // forme fermée เ◌ิ◌
  P('v:เ–ะ', `เ(${CL})็`), // forme fermée เ◌็◌
  P('v:แ–ะ', `แ(${CL})็`),
  P('v:เ–', `เ(${CL})`),
  P('v:แ–', `แ(${CL})`),
  P('v:โ–', `โ(${CL})`),
  P('v:ใ–', `ใ(${CL})`),
  P('v:ไ–', `ไ(${CL})`),
  P('v:–ัว', `(${CL})ั${TM}ว`),
  // forme fermée de ua : ◌ว◌ (สวน, สวย, ควร) — ว suivi d'une consonne finale sans voyelle
  P('v:–ัว', `([ก-ฮ])ว${TM}(?=[ก-ฮ](?:[^${VS}]|$))`),
  P('v:–ือ', `(${CL})ื${TM}อ`),
  P('v:–ือ', `(${CL})ื`), // forme fermée ◌ื◌
  P('v:เ–าะ', `(${CL})็อ`), // forme fermée ◌็อ◌
  P('v:–ำ', `(${CL})${TM}ำ`),
  P('v:–ะ', `(${CL})${TM}ะ`),
  P('v:–ะ', `(${CL})ั`), // forme fermée ◌ั◌
  P('v:–า', `(${CL})${TM}า`),
  P('v:–ิ', `(${CL})ิ`),
  P('v:–ี', `(${CL})ี`),
  P('v:–ึ', `(${CL})ึ`),
  P('v:–ุ', `(${CL})ุ`),
  P('v:–ู', `(${CL})ู`),
  P('v:–อ', `(${CL})${TM}อ(?!อ)`), // ทางออก : อ + อ = consonne อ suivie de la voyelle อ
  P('rule:ko', `ก็(?!อ)`), // ก็ (kɔ̂ɔ) : graphie exceptionnelle
  P('v:ฤๅ', `ฤๅ`),
  P('v:ฤ', `ฤ(?!ๅ)`),
];

const LIVE_FINALS = new Set('นมงยว');
const DEAD_FINALS = new Set('กดบตป');
const SONORANT = 'งญนมยรลว';
const IS_TONE_MARK = /[่้๊๋]/;
const IS_VOWEL_SIGN = new RegExp(`[${VS}]`);
const IS_CONS = /[ก-ฮ]/;

const finalRule = (f: string) => (LIVE_FINALS.has(f) ? 'rule:final-live' : DEAD_FINALS.has(f) ? 'rule:final-dead' : 'rule:final-irregular');

export function readingRequirements(input: string): Set<string> {
  const req = new Set<string>();
  const T = input.normalize('NFC').replace(/\{[^}]*\}/g, '').replace(/[\s.…!?,]/g, '');
  const n = T.length;
  const consumed = new Uint8Array(n); // caractères pris par un motif (hors consonne initiale)
  const initial = new Uint8Array(n); // consonnes initiales de syllabe (première lettre du groupe)
  const initialSpan = new Uint8Array(n); // toutes les lettres d'un groupe initial
  const patternEnd: number[] = [];

  for (let i = 0; i < n; i++) {
    const ch = T[i];
    if (IS_TONE_MARK.test(ch)) req.add('m:' + ('่้๊๋'.indexOf(ch) + 1));
    else if (ch === '์') req.add('rule:karan');
    else if (ch === 'ๆ') req.add('rule:maiyamok');
    else if (ch === 'ฯ') req.add('rule:paiyan');
    else if (/[๐-๙]/.test(ch)) req.add('rule:digits');
  }

  for (const p of PATTERNS) {
    p.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.re.exec(T))) {
      const start = m.index, end = start + m[0].length;
      const cl = m[1] ?? '';
      const consStart = cl ? start + m[0].indexOf(cl) : -1;
      if (p.id === 'rule:ko') { consumed[start + 1] = 1; initialSpan[start] = 1; initial[start] = 1; req.add(p.id); patternEnd.push(end); p.re.lastIndex = end; continue; }
      let clash = false;
      for (let i = start; i < end; i++) if (consumed[i] || (initialSpan[i] && !(cl && i >= consStart && i < consStart + cl.length))) clash = true;
      if (cl && initialSpan[consStart]) clash = true;
      if (clash) { p.re.lastIndex = start + 1; continue; }
      for (let i = start; i < end; i++) if (!(cl && i >= consStart && i < consStart + cl.length)) consumed[i] = 1;
      req.add(p.id);
      if (cl) {
        initial[consStart] = 1;
        for (let i = 0; i < cl.length; i++) initialSpan[consStart + i] = 1;
        if (cl.length === 2) {
          if (cl[0] === 'ห' && SONORANT.includes(cl[1])) req.add('rule:hnam');
          else if (cl === 'อย') req.add('rule:onam');
          else if (/^[สศจซ]ร$/.test(cl)) req.add('rule:silent-r'); // สร้าง, เสร็จ, จริง : ร muet
          else req.add('rule:cluster');
        }
      }
      patternEnd.push(end);
      p.re.lastIndex = end;
    }
  }

  // Signes vocaliques orphelins → motif inconnu
  for (let i = 0; i < n; i++) if (!consumed[i] && IS_VOWEL_SIGN.test(T[i]) && !IS_CONS.test(T[i])) req.add('ch:' + T[i]);

  const isFinal = new Uint8Array(n);
  // Consonnes finales : une consonne juste après un motif, qui n'ouvre pas un nouveau motif
  for (const end of patternEnd) {
    let k = end;
    while (k < n && IS_TONE_MARK.test(T[k])) k++;
    if (k < n && IS_CONS.test(T[k]) && !initialSpan[k] && !consumed[k] && T[k + 1] !== '์') {
      req.add(finalRule(T[k]));
      isFinal[k] = 1;
      if (T[k + 1] === 'ร' && k + 2 === n) { req.add('rule:silent-r'); consumed[k + 1] = 1; } // บัตร, จักร : ร final muet
    }
  }

  // Voyelles implicites : consonnes « nues » (ni initiale d'un motif, ni finale, ni partie de voyelle)
  for (let i = 0; i < n; i++) {
    if (!IS_CONS.test(T[i]) || initialSpan[i] || consumed[i] || isFinal[i]) continue;
    if (T[i + 1] === '์') continue; // lettre muette
    let j = i + 1;
    while (j < n && IS_TONE_MARK.test(T[j])) j++; // ส้ม : la marque de ton se place entre les deux consonnes
    const next = T[j];
    if (next && IS_CONS.test(next) && !initialSpan[j] && !consumed[j] && !isFinal[j]) {
      const nn = T[j + 1];
      if (nn && IS_CONS.test(nn) && !initialSpan[j + 1] && !consumed[j + 1] && !isFinal[j + 1] && !T[j + 2]) {
        // C C C en fin : ห นำ + o implicite (หมด), sinon a implicite + o implicite (ถนน tha-non)
        if (T[i] === 'ห' && SONORANT.includes(next)) req.add('rule:hnam'); else req.add('rule:implicit-a');
        req.add('rule:implicit-o'); req.add(finalRule(nn)); isFinal[j + 1] = 1; i = j + 1;
      } else if (!nn || initialSpan[j + 1] || (!IS_VOWEL_SIGN.test(nn) && !IS_CONS.test(nn))) {
        // C C (fin) : o implicite, la seconde est finale
        req.add('rule:implicit-o'); req.add(finalRule(next)); isFinal[j] = 1; i = j;
      } else {
        // C C V… : a implicite sur la première (สบาย)
        req.add('rule:implicit-a');
      }
    } else if (next && (initialSpan[j] || IS_VOWEL_SIGN.test(next))) {
      req.add('rule:implicit-a');
    } else if (!next) {
      req.add('ch:' + T[i]);
    }
  }
  // Consonnes prononcées : celles qui ne servent ni de partie de voyelle ni de lettre muette
  for (let i = 0; i < n; i++) if (IS_CONS.test(T[i]) && !consumed[i]) req.add('c:' + T[i]);
  return req;
}

/** Le mot est-il lisible avec les notions connues ? */
export const isReadable = (thai: string, known: ReadonlySet<string>) => [...readingRequirements(thai)].every((r) => known.has(r));

export const missingRequirements = (thai: string, known: ReadonlySet<string>) => [...readingRequirements(thai)].filter((r) => !known.has(r));

/** Un mot d'une seule syllabe ouverte (consonne + voyelle, sans finale) ? */
export function isOpenMonosyllable(thai: string): boolean {
  const r = readingRequirements(thai);
  if ([...r].some((x) => x.startsWith('rule:final') || x.startsWith('rule:implicit') || x.startsWith('ch:'))) return false;
  return [...r].filter((x) => x.startsWith('v:')).length === 1;
}

/** Nombre de syllabes estimé (motifs vocaliques + voyelles implicites). */
export function syllableCount(thai: string): number {
  const r = readingRequirements(thai);
  return [...r].filter((x) => x.startsWith('v:')).length + (r.has('rule:implicit-o') ? 1 : 0) + (r.has('rule:implicit-a') ? 1 : 0);
}
