// Captures des écrans principaux (clair et sombre) sur le build de production, pour vérifier la refonte visuelle.
// Usage : BASE=http://localhost:4174 node scripts/shots-ui.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const OUT = 'scripts/out/ui';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium' });

async function run(scheme) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR', colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(BASE + '/#/onboarding');
  await page.getByPlaceholder('Prénom').fill('Lu');
  await page.getByRole('button', { name: /Un homme/ }).click();
  await page.getByRole('button', { name: /Continuer/ }).click();
  await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.getByRole('button', { name: /Construire mon parcours/ }).click();
  await page.waitForURL(/#\/$/);
  await page.evaluate(() => {
    const st = window.__langueStore.getState();
    st.updateSettings({ autoAdvance: false });
    st.recordActivity('comp:d:market', 4, 5);
    for (const id of ['c:ก', 'c:ข', 'c:ค', 'c:ง', 'c:จ', 'c:ด', 'c:ต', 'c:บ', 'c:ป', 'c:อ']) { st.answer(id, true); st.answer(id, true); }
  });
  const shot = async (name, full = true) => { await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/${scheme}-${name}.png`, fullPage: full }); console.log('✓', scheme, name); };
  await page.goto(BASE + '/#/'); await shot('home');
  // leçon : écran de théorie, puis une question, puis la correction
  await page.locator('a.cta').click();
  await page.waitForURL(/#\/lesson\//);
  await shot('lesson-theory', false);
  for (let k = 0; k < 6; k++) {
    if (await page.locator('.choices .choice').count()) break;
    const c = page.getByRole('button', { name: /^Continuer$/ });
    if (await c.isVisible().catch(() => false)) { await c.click(); await page.waitForTimeout(300); continue; }
    const r = page.getByRole('button', { name: /^Voir la réponse$/ });
    if (await r.isVisible().catch(() => false)) { await r.click(); await page.locator('.rate button[data-q="3"]').click(); await page.waitForTimeout(300); continue; }
    await page.waitForTimeout(300);
  }
  await shot('lesson-question', false);
  if (await page.locator('.choices .choice').count()) { await page.locator('.choices .choice').first().click(); await shot('lesson-feedback', false); }
  await page.goto(BASE + '/#/review'); await shot('review');
  await page.goto(BASE + '/#/explore'); await shot('explore');
  await page.goto(BASE + '/#/profile'); await shot('profile');
  await page.goto(BASE + '/#/profile/progress'); await shot('progress');
  await page.goto(BASE + '/#/play'); await shot('play');
  await page.goto(BASE + '/#/path'); await shot('path');
  await ctx.close();
}
await run('light');
await run('dark');
await browser.close();
