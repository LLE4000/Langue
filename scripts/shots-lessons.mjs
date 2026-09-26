// Joue les premières leçons du parcours d'un débutant et capture chaque étape (avant et après réponse), pour
// vérifier le rendu réel des leçons. Usage : BASE=http://localhost:4174 N=6 SCHEMES=light,dark WIDTH=390 node scripts/shots-lessons.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const OUT = process.env.OUT ?? 'scripts/out/lessons';
const N = Number(process.env.N ?? 6);
const WIDTH = Number(process.env.WIDTH ?? 390), HEIGHT = Math.round(WIDTH * 2.16);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium' });

const R = (x) => (x ?? '').replace(/\{P\}|\{Q\}/g, 'ครับ').replace(/\{I\}/g, 'ผม').replace(/\{p\}|\{q\}/g, 'khráp').replace(/\{i\}/g, 'phǒm');
const state = (page) => page.evaluate(() => {
  const s = window.__langueStore.getState().session; if (!s) return null;
  const st = s.steps[s.index];
  return { index: s.index, total: s.steps.length, type: st.type, questions: st.questions?.map((q) => ({ choices: q.choices.map((c) => ({ thai: c.thai, rom: c.rom, text: c.text, ok: c.ok })), spell: q.spell?.target })) };
});

async function run(scheme) {
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2, locale: 'fr-FR', colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(BASE + '/#/onboarding');
  await page.getByPlaceholder('Prénom').fill('Lucien');
  await page.getByRole('button', { name: /Un homme/ }).click();
  await page.getByRole('button', { name: /Continuer/ }).click();
  await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.getByRole('button', { name: /Construire mon parcours/ }).click();
  await page.waitForURL(/#\/$/);
  await page.evaluate(() => window.__langueStore.getState().updateSettings({ autoAdvance: false }));

  for (let L = 1; L <= N; L++) {
    await page.goto(BASE + '/#/');
    await page.waitForTimeout(400);
    const id = (await page.locator('a.cta').getAttribute('href')).split('/').pop();
    const tag = `${scheme}-${WIDTH}-L${L}-${id}`;
    await page.screenshot({ path: `${OUT}/${tag}-00-home.png` });
    await page.locator('a.cta').click();
    await page.waitForURL(/#\/lesson\//);
    await page.waitForTimeout(500);
    const perStep = {};
    let shot = 0, wrongDone = L > 1;
    const snap = async (what) => { shot++; await page.waitForTimeout(250); await page.screenshot({ path: `${OUT}/${tag}-${String(shot).padStart(2, '0')}-${what}.png` }); };
    for (let guard = 0; guard < 300; guard++) {
      if (await page.getByText(/Leçon validée|Pas encore acquis/).isVisible().catch(() => false)) { await snap('recap'); await page.screenshot({ path: `${OUT}/${tag}-99-recap-full.png`, fullPage: true }); break; }
      const s = await state(page);
      const key = s ? `${s.index}-${s.type}` : 'none';
      perStep[key] = (perStep[key] ?? 0) + 1;
      const first = perStep[key] === 1, few = perStep[key] <= 2;
      if (s && s.type === 'theory' && first) { await snap(`s${s.index}-theory`); await page.screenshot({ path: `${OUT}/${tag}-${String(shot).padStart(2, '0')}-s${s.index}-theory-full.png`, fullPage: true }); }
      const cont = page.getByRole('button', { name: /^Continuer$/ });
      if (await cont.isVisible().catch(() => false)) { if (s && s.type !== 'theory' && s.type !== 'questions' && first) await snap(`s${s.index}-${s.type}`); await cont.click(); continue; }
      const reveal = page.getByRole('button', { name: /^Voir la réponse$/ });
      if (await reveal.isVisible().catch(() => false)) {
        if (first) await snap(`s${s?.index}-card-front`);
        await reveal.click();
        if (first) await snap(`s${s?.index}-card-back`);
        await page.locator('.rate button[data-q="3"]').click(); continue;
      }
      const spell = page.locator('.tiles-spell');
      if (s?.questions && (await spell.isVisible().catch(() => false))) {
        if (few) await snap(`s${s.index}-spell`);
        const q = s.questions.find((x) => x.spell);
        if (q?.spell) for (const ch of [...q.spell]) { const b = spell.locator('button:not(.used)', { hasText: ch }).first(); if (await b.count()) await b.click(); }
        const nb = page.locator('.qfoot .btn');
        if (await nb.isVisible({ timeout: 2000 }).catch(() => false)) { if (first) await snap(`s${s.index}-spell-done`); await nb.click(); continue; }
        await page.getByRole('button', { name: 'Effacer' }).click().catch(() => {}); continue;
      }
      const choices = page.locator('.choices:not(.lock) .choice');
      const n = await choices.count();
      if (n > 0 && s?.questions) {
        if (few) await snap(`s${s.index}-q`);
        const texts = [];
        for (let k = 0; k < n; k++) texts.push((await choices.nth(k).innerText()).replace(/\s+/g, ' ').trim());
        const norm = (x) => x.replace(/\s+/g, ' ').trim();
        const labels = s.questions.map((q) => ({ labels: q.choices.map((c) => [R(c.thai), R(c.rom), R(c.text)].filter(Boolean).join(' ').trim()), ok: q.choices.findIndex((c) => c.ok) }));
        const q = labels.find((x) => x.labels.length === n && x.labels.every((l) => texts.some((tx) => norm(tx) === norm(l) || (l && tx.includes(l)))));
        const okLabel = q ? q.labels[q.ok] : null;
        let idx = okLabel ? texts.findIndex((tx) => norm(tx) === norm(okLabel) || tx.includes(okLabel)) : 0;
        if (!wrongDone && n > 1) { idx = idx === 0 ? 1 : 0; wrongDone = true; await choices.nth(idx).click(); await snap(`s${s.index}-q-wrong`); }
        else { await choices.nth(Math.max(0, idx)).click(); if (first) await snap(`s${s.index}-q-right`); }
        await page.locator('.qfoot .btn').click(); continue;
      }
      if ((await page.locator('.pr:not(.ok)').count()) > 0) {
        await snap(`s${s?.index}-match`);
        const cols = page.locator('.pr').locator('xpath=..');
        const leftCol = cols.first(), rightCol = cols.last();
        for (let a = 0; a < 8; a++) {
          const left = leftCol.locator('.pr:not(.ok)').first();
          if (!(await left.count())) break;
          const pid = await left.getAttribute('data-pair');
          await left.click();
          if (a === 0) await snap(`s${s?.index}-match-select`);
          await rightCol.locator(`.pr[data-pair="${pid}"]`).click();
          await page.waitForTimeout(150);
          if (a === 1) await snap(`s${s?.index}-match-pairs`);
        }
        await page.waitForTimeout(800); continue;
      }
      const toks = page.locator('.tline').nth(1).locator('.tok:not(.used)');
      if ((await toks.count()) > 0) {
        await snap(`s${s?.index}-build`);
        while ((await page.locator('.tline').nth(1).locator('.tok:not(.used)').count()) > 0) await page.locator('.tline').nth(1).locator('.tok:not(.used)').first().click();
        await page.getByRole('button', { name: 'Vérifier' }).click();
        await snap(`s${s?.index}-build-checked`);
        await page.locator('.qfoot .btn').click(); continue;
      }
      let acted = false;
      for (const name of [/^Passer l’exercice$/, /^Terminer$/, /^Mot suivant$/]) {
        const b = page.getByRole('button', { name });
        if (await b.isVisible().catch(() => false)) { if (few) await snap(`s${s?.index}-${s?.type}`); await b.click(); acted = true; break; }
      }
      if (!acted) await page.waitForTimeout(150);
    }
    console.log('✓', tag, shot, 'captures');
  }
  await ctx.close();
}
for (const scheme of (process.env.SCHEMES ?? 'light,dark').split(',')) await run(scheme);
await browser.close();
