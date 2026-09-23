/** Intégrité du contenu : identifiants, transcription, thèmes, dialogues, lectures, grammaire. */
import { describe, expect, it } from 'vitest';
import { th, ITEMS, DIALOG_BY_ID, GRAMMAR_BY_ID, MAIN_WORDS } from './th';
import { THEME_ORAL } from '@/curriculum/th-fr/talk';

// Lettres autorisées dans la transcription pédagogique (voir README, « Transcription »).
const ROM = /^[a-zʉɛɔəŋ̀-ͯ\s\-.…{}pqi?']+$/i;

describe('vocabulaire', () => {
  it('pas de doublon à l’intérieur d’un thème, identifiants cohérents', () => {
    for (const t of th.VOCAB_THEMES) {
      const ids = t.items.map((w) => w.id);
      expect(new Set(ids).size, t.id).toBe(ids.length);
      for (const w of t.items) {
        expect(w.id, w.thai).toBe('w:' + w.thai);
        expect(w.rom.normalize('NFD'), w.thai).toMatch(ROM);
        expect(w.meaning.fr.length, w.thai).toBeGreaterThan(0);
        if (w.example) { expect(w.example.thai.length).toBeGreaterThan(0); expect(w.example.rom.normalize('NFD'), w.example.thai).toMatch(ROM); expect(w.example.meaning.fr.length).toBeGreaterThan(0); }
      }
    }
  });
  it('un même mot dans plusieurs thèmes garde une seule fiche', () => {
    const ids = MAIN_WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('ordre du parcours et niveaux oraux couvrent tous les thèmes', () => {
    const all = th.VOCAB_THEMES.map((t) => t.id);
    for (const id of all) { expect(th.THEME_ORDER, id).toContain(id); expect(THEME_ORAL[id], `THEME_ORAL ${id}`).toBeDefined(); }
    for (const id of th.THEME_ORDER) expect(all, id).toContain(id);
    for (const g of th.THEME_GROUPS) for (const id of g.ids) expect(all, `groupe ${g.title.fr} → ${id}`).toContain(id);
  });
  it('les jetons de genre sont appariés (thaï ↔ transcription)', () => {
    for (const w of MAIN_WORDS) {
      expect(/\{P\}/.test(w.thai), w.thai).toBe(/\{p\}/.test(w.rom));
      expect(/\{Q\}/.test(w.thai), w.thai).toBe(/\{q\}/.test(w.rom));
      expect(/\{I\}/.test(w.thai), w.thai).toBe(/\{i\}/.test(w.rom));
    }
  });
});

describe('dialogues, lectures, grammaire', () => {
  it('chaque thème lié à un dialogue pointe vers un dialogue existant', () => {
    for (const [theme, d] of Object.entries(th.DIALOG_FOR_THEME)) { expect(DIALOG_BY_ID[d], `${theme} → ${d}`).toBeDefined(); expect(th.VOCAB_THEMES.some((t) => t.id === theme), theme).toBe(true); }
    expect(new Set(th.DIALOGS.map((d) => d.id)).size).toBe(th.DIALOGS.length);
    for (const d of th.DIALOGS) for (const l of d.lines) { expect(l.rom.normalize('NFD'), l.thai).toMatch(ROM); expect(l.tr.fr.length, l.thai).toBeGreaterThan(0); }
  });
  it('les lectures ont des jetons complets', () => {
    expect(new Set(th.READINGS.map((r) => r.id)).size).toBe(th.READINGS.length);
    for (const r of th.READINGS) for (const s of r.sentences) { expect(s.tokens.length, r.id).toBeGreaterThan(0); for (const t of s.tokens) { expect(t.rom.normalize('NFD'), t.thai).toMatch(ROM); expect(t.gloss.fr.length, t.thai).toBeGreaterThan(0); } }
  });
  it('les fiches de grammaire sont uniques et enregistrées comme éléments', () => {
    expect(new Set(th.GRAMMAR.map((g) => g.id)).size).toBe(th.GRAMMAR.length);
    for (const g of th.GRAMMAR) { expect(ITEMS[g.id], g.id).toBeDefined(); expect(GRAMMAR_BY_ID[g.id]).toBeDefined(); expect(g.examples.length).toBeGreaterThan(0); }
  });
  it('volume attendu', () => {
    expect(th.VOCAB_THEMES.length).toBeGreaterThanOrEqual(45);
    expect(MAIN_WORDS.length).toBeGreaterThan(880);
    expect(th.DIALOGS.length).toBeGreaterThanOrEqual(30);
    expect(th.READINGS.length).toBeGreaterThanOrEqual(19);
    expect(th.GRAMMAR.length).toBeGreaterThanOrEqual(34);
  });
});
