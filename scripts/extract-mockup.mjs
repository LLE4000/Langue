#!/usr/bin/env node
/**
 * Extrait les données pédagogiques de la maquette HTML d'origine (fichier unique)
 * et les écrit en JSON dans scripts/out/. Les fichiers TypeScript de src/content
 * ont été générés une première fois à partir de ce JSON puis sont maintenus à la main.
 *
 * Usage : node scripts/extract-mockup.mjs <chemin/vers/maquette.html>
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const src = process.argv[2];
if (!src) { console.error('Chemin de la maquette manquant.'); process.exit(1); }
const html = fs.readFileSync(src, 'utf8');
const script = html.slice(html.indexOf('"use strict";'), html.indexOf('SECTION MOTEUR 1'));
// La section DONNÉES s'arrête juste avant le bloc de commentaire du moteur.
const code = script.slice(0, script.lastIndexOf('/* ====='));

const ctx = {};
vm.createContext(ctx);
vm.runInContext(code + `
;globalThis.__out = { CONSONANT_ROWS, CONSONANT_ORDER, CLASS_INFO, VOWEL_ROWS, VOWEL_GROUPS, POS_LABEL, TONES, TONE_MARKS, TONE_WORDS,
  DIGITS, NUM_UNITS, NUM_KEY, NUM_NOTES, PHON_GUIDE, VOCAB, TRAVEL, SOS_NUMBERS, DIALOGS, READINGS, GRAMMAR, CLASSIFIERS, CLF_PATTERNS, CLF_QUIZ, TONE_SETS, GLOSS };
`, ctx);
const out = ctx.__out;

// Petites constantes définies plus loin dans l'interface : on les récupère par expression régulière.
const grab = (name) => {
  const m = html.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`));
  return m ? vm.runInNewContext(m[1]) : null;
};
out.LOOKALIKES = grab('LOOKALIKES');
out.NEAR_SOUND = grab('NEAR_SOUND');
out.LETTER_TIPS = grab('LETTER_TIPS');
out.CAT_ORDER_TH = grab('CAT_ORDER_TH');
out.VOCAB_GROUPS = grab('VOCAB_GROUPS');
const dfc = html.match(/const DLG_FOR_CAT = (\{[^}]*\});/);
out.DLG_FOR_CAT = dfc ? vm.runInNewContext('(' + dfc[1] + ')') : null;

const dir = path.join(path.dirname(new URL(import.meta.url).pathname), 'out');
fs.mkdirSync(dir, { recursive: true });
for (const [k, v] of Object.entries(out)) fs.writeFileSync(path.join(dir, k + '.json'), JSON.stringify(v, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.length : Object.keys(v).length}`).join('\n'));
