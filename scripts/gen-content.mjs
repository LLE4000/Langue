#!/usr/bin/env node
/**
 * Génère les fichiers TypeScript de src/content/th/ à partir du JSON extrait de la maquette (scripts/out).
 * Exécuté une fois lors de la migration ; conservé pour référence et pour rejouer une migration.
 */
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const inDir = path.join(here, 'out');
const outDir = path.join(here, '..', 'src', 'content', 'th');
fs.mkdirSync(outDir, { recursive: true });
const J = (n) => JSON.parse(fs.readFileSync(path.join(inDir, n + '.json'), 'utf8'));
const L = (fr) => ({ fr });
/** Sérialisation compacte sur une ligne, sûre pour les chaînes (aucune substitution à l'intérieur des textes). */
function line(v) {
  if (Array.isArray(v)) return '[' + v.map(line).join(', ') + ']';
  if (v && typeof v === 'object') return '{ ' + Object.entries(v).map(([k, x]) => (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k) ? k : JSON.stringify(k)) + ': ' + line(x)).join(', ') + ' }';
  return JSON.stringify(v);
}
const file = (name, header, body) => fs.writeFileSync(path.join(outDir, name), `// Généré depuis la maquette d'origine par scripts/gen-content.mjs, puis maintenu à la main.\n${header}\n${body}\n`);
const arr = (name, type, items) => `export const ${name}: ${type}[] = [\n${items.map((x) => '  ' + line(x) + ',').join('\n')}\n];`;

/* ---------- Consonnes ---------- */
const cons = J('CONSONANT_ROWS').map((r) => {
  const o = { id: 'c:' + r[0], char: r[0], nameWord: r[1], nameRom: r[2], nameMeaning: L(r[3]), cls: r[4], initial: r[5], initialIPA: r[6], final: r[7], audioBase: r[8] };
  if (r[9]) o.note = L(r[9]);
  if (/obsolète/.test(r[9])) o.obsolete = true;
  if (/rare/i.test(r[9])) o.rare = true;
  return o;
});
file('consonants.ts', `import type { Consonant } from '../types';\n\n/** Ordre d'introduction des consonnes dans le parcours (fréquence et utilité). */\nexport const CONSONANT_ORDER = ${JSON.stringify(J('CONSONANT_ORDER'))};\n`, arr('CONSONANTS', 'Consonant', cons));

/* ---------- Voyelles ---------- */
const vowelChars = (form) => [...form.replace(/–/g, '')];
const vows = J('VOWEL_ROWS').map((r) => {
  const o = { id: 'v:' + r[0], form: r[0], rom: r[1], ipa: r[2], length: r[3], group: r[4], positions: r[5], chars: vowelChars(r[0]) };
  if (r[6]) o.closedForm = r[6];
  if (r[7]) o.example = { thai: r[7], rom: r[8], meaning: L(r[9]) };
  if (r[10]) o.note = L(r[10]);
  return o;
});
file('vowels.ts', `import type { Vowel } from '../types';\n`, arr('VOWELS', 'Vowel', vows));

/* ---------- Tons ---------- */
const tones = J('TONES').map((t) => ({ id: t.id, name: L(t.fr), thaiName: t.th, rom: t.rom, mark: t.mark, color: t.color, path: t.path, desc: L(t.desc), example: { thai: t.ex[0], rom: t.ex[1], meaning: L(t.ex[2]) } }));
const marks = J('TONE_MARKS').map((m) => ({ n: m.n, char: m.ch, name: m.name, rom: m.rom }));
const tw = J('TONE_WORDS').map((r) => { const o = { id: 't:' + r[0], thai: r[0], rom: r[1], meaning: L(r[2]), cls: r[3], live: !!r[4], long: !!r[5], mark: r[6] }; if (r[7]) o.note = L(r[7]); return o; });
const ts = J('TONE_SETS').map((s) => { const o = { words: s.w }; if (s.note) o.note = L(s.note); return o; });
file('tones.ts', `import type { Tone, ToneMark, ToneWord, ToneSet } from '../types';\n`, [arr('TONES', 'Tone', tones), arr('TONE_MARKS', 'ToneMark', marks), '/** Monosyllabes analysés à la main pour les règles de ton. */', arr('TONE_WORDS', 'ToneWord', tw), '/** Séries « même syllabe, tons différents ». */', arr('TONE_SETS', 'ToneSet', ts)].join('\n\n'));

/* ---------- Nombres ---------- */
file('numbers.ts', '', [
  `/** Chiffres thaïs : [chiffre thaï, mot, transcription]. */\nexport const DIGITS: [string, string, string][] = ${JSON.stringify(J('DIGITS'))};`,
  `export const NUM_UNITS: [number, string, string][] = ${JSON.stringify(J('NUM_UNITS'))};`,
  `/** Nombres clés enseignés et révisés. */\nexport const NUM_KEY: number[] = ${JSON.stringify(J('NUM_KEY'))};`,
  `export const NUM_NOTES: { fr: string }[] = [\n${J('NUM_NOTES').map((n) => '  ' + line(L(n)) + ',').join('\n')}\n];`,
].join('\n\n'));

/* ---------- Vocabulaire ---------- */
const themes = J('VOCAB').map((c) => ({ id: c.id, name: L(c.fr), icon: c.icon, items: c.items.map((r) => { const o = { id: 'w:' + r[0], thai: r[0], rom: r[1], meaning: L(r[2]), themes: [c.id] }; if (r[3]) o.example = { thai: r[3], rom: r[4], meaning: L(r[5]) }; return o; }) }));
const themeBody = themes.map((t) => `  {\n    id: ${JSON.stringify(t.id)}, name: ${line(t.name)}, icon: ${JSON.stringify(t.icon)},\n    items: [\n${t.items.map((i) => '      ' + line(i) + ',').join('\n')}\n    ],\n  },`).join('\n');
file('vocabulary.ts', `import type { VocabTheme } from '../types';\n\n/** Ordre d'utilité des thèmes dans le parcours. */\nexport const THEME_ORDER: string[] = ${JSON.stringify(J('CAT_ORDER_TH'))};\n\n/** Regroupement des thèmes dans la bibliothèque. */\nexport const THEME_GROUPS: { title: { fr: string }; ids: string[] }[] = [\n${J('VOCAB_GROUPS').map((g) => `  { title: ${line(L(g[0]))}, ids: ${JSON.stringify(g[1])} },`).join('\n')}\n];\n`, `export const VOCAB_THEMES: VocabTheme[] = [\n${themeBody}\n];`);

/* ---------- Grammaire ---------- */
const gram = J('GRAMMAR').map((g) => { const o = { id: 'g:' + g.id, icon: g.icon, title: L(g.fr), rule: L(g.rule), pattern: g.pattern, examples: g.ex.map((e) => ({ thai: e[0], rom: e[1], meaning: L(e[2]) })) }; if (g.tip) o.tip = L(g.tip); return o; });
file('grammar.ts', `import type { GrammarPoint } from '../types';\n`, `export const GRAMMAR: GrammarPoint[] = [\n${gram.map((g) => `  {\n    id: ${JSON.stringify(g.id)}, icon: ${JSON.stringify(g.icon)}, title: ${line(g.title)},\n    rule: ${line(g.rule)},\n    pattern: ${JSON.stringify(g.pattern)},\n    examples: [\n${g.examples.map((e) => '      ' + line(e) + ',').join('\n')}\n    ],${g.tip ? `\n    tip: ${line(g.tip)},` : ''}\n  },`).join('\n')}\n];`);

/* ---------- Dialogues ---------- */
const dlgs = J('DIALOGS').map((d) => ({ id: 'd:' + d.id, title: L(d.fr), icon: d.icon, other: L(d.other), lines: d.lines.map((l) => ({ who: l[0] === 'me' ? 'me' : 'other', thai: l[1], rom: l[2], tr: L(l[3]) })) }));
file('dialogs.ts', `import type { Dialog } from '../types';\n\n/** Dialogue rattaché à un thème de vocabulaire dans le parcours. */\nexport const DIALOG_FOR_THEME: Record<string, string> = ${JSON.stringify(Object.fromEntries(Object.entries(J('DLG_FOR_CAT')).map(([k, v]) => [k, 'd:' + v])))};\n`, `export const DIALOGS: Dialog[] = [\n${dlgs.map((d) => `  {\n    id: ${JSON.stringify(d.id)}, title: ${line(d.title)}, icon: ${JSON.stringify(d.icon)}, other: ${line(d.other)},\n    lines: [\n${d.lines.map((l) => '      ' + line(l) + ',').join('\n')}\n    ],\n  },`).join('\n')}\n];`);

/* ---------- Lectures ---------- */
const reads = J('READINGS').map((r) => ({ id: 'r:' + r.id, level: r.lvl, title: L(r.fr), sentences: r.s.map((s) => ({ tr: L(s[0]), tokens: s.slice(1).map((t) => ({ thai: t[0], rom: t[1], gloss: L(t[2]) })) })) }));
file('readings.ts', `import type { Reading } from '../types';\n`, `export const READINGS: Reading[] = [\n${reads.map((r) => `  {\n    id: ${JSON.stringify(r.id)}, level: ${r.level}, title: ${line(r.title)},\n    sentences: [\n${r.sentences.map((s) => `      { tr: ${line(s.tr)}, tokens: [\n${s.tokens.map((t) => '        ' + line(t) + ',').join('\n')}\n      ] },`).join('\n')}\n    ],\n  },`).join('\n')}\n];`);

/* ---------- Classificateurs ---------- */
const clfs = J('CLASSIFIERS').map((r) => ({ id: 'k:' + r[0], thai: r[0], rom: r[1], use: L(r[2]), example: { thai: r[3], rom: r[4], meaning: L(r[5]) } }));
file('classifiers.ts', `import type { Classifier } from '../types';\n`, [arr('CLASSIFIERS', 'Classifier', clfs),
  `/** Schémas d'emploi : [usage, schéma, exemple thaï, transcription, traduction]. */\nexport const CLF_PATTERNS: { use: { fr: string }; pattern: { fr: string }; thai: string; rom: string; meaning: { fr: string } }[] = [\n${J('CLF_PATTERNS').map((p) => '  ' + line({ use: L(p[0]), pattern: L(p[1]), thai: p[2], rom: p[3], meaning: L(p[4]) }) + ',').join('\n')}\n];`,
  `/** Exercice : nom → classificateur attendu. */\nexport const CLF_QUIZ: { thai: string; rom: string; meaning: { fr: string }; clf: string }[] = [\n${J('CLF_QUIZ').map((r) => '  ' + line({ thai: r[0], rom: r[1], meaning: L(r[2]), clf: r[3] }) + ',').join('\n')}\n];`].join('\n\n'));

/* ---------- Lexique mot à mot, voyage, divers ---------- */
file('gloss.ts', `import type { GlossEntry } from '../types';\n\n/** Mots-outils et mots très fréquents : sert au découpage « mot à mot » des phrases. */`, arr('GLOSS', 'GlossEntry', J('GLOSS').map((g) => ({ thai: g[0], rom: g[1], meaning: L(g[2]) }))));
file('phrasebook.ts', `import type { PhraseBookSection } from '../types';\n\n/** Numéros d'urgence en Thaïlande. */\nexport const SOS_NUMBERS: { number: string; label: { fr: string } }[] = [\n${J('SOS_NUMBERS').map((n) => '  ' + line({ number: n[0], label: L(n[1]) }) + ',').join('\n')}\n];\n`, arr('PHRASEBOOK', 'PhraseBookSection', J('TRAVEL').map((t) => ({ id: t.id, title: L(t.fr), icon: t.icon, keys: t.keys }))));
file('alphabetExtras.ts', `/** Groupes de consonnes de forme voisine (repère visuel pédagogique). */\nexport const LOOKALIKES: string[][] = ${JSON.stringify(J('LOOKALIKES'))};\n\n/** Sons voisins que l'oreille francophone confond : [étiquette, lettres]. */\nexport const NEAR_SOUNDS: [string, string][] = ${JSON.stringify(J('NEAR_SOUND'))};\n\n/** Conseils affichés au fil des leçons d'alphabet. */\nexport const LETTER_TIPS: { fr: string }[] = [\n${J('LETTER_TIPS').map((t) => '  ' + line(L(t)) + ',').join('\n')}\n];\n`, '');
const pg = J('PHON_GUIDE');
file('phonGuide.ts', `/** Guide de la transcription utilisée dans l'application. */`, [
  `export const PHON_CONSONANTS: { rom: string; ipa: string; letters: string; help: { fr: string } }[] = [\n${pg.cons.map((c) => '  ' + line({ rom: c[0], ipa: c[1], letters: c[2], help: L(c[3]) }) + ',').join('\n')}\n];`,
  `export const PHON_VOWELS: { rom: string; ipa: string; help: { fr: string } }[] = [\n${pg.vow.map((c) => '  ' + line({ rom: c[0], ipa: c[1], help: L(c[2]) }) + ',').join('\n')}\n];`].join('\n\n'));
console.log('Contenu généré dans', outDir);
