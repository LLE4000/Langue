// Captures des écrans de progression et des réglages (vérification visuelle), sur le build de production.
// Usage : node scripts/shots-progress.mjs  (le serveur de prévisualisation doit tourner sur 4173)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4173';
const OUT = 'scripts/out/progress';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR' });
const page = await ctx.newPage();
await page.goto(BASE + '/#/onboarding');
// onboarding (même enchaînement que les tests e2e) : prénom, homme, objectif, « j'ai déjà des bases » → niveaux 1
await page.getByPlaceholder('Prénom').fill('Lu');
await page.getByRole('button', { name: /Un homme/ }).click();
await page.getByRole('button', { name: /Continuer/ }).click();
await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
await page.getByRole('button', { name: /déjà des bases/ }).click();
const groups = page.getByRole('radiogroup', { name: /Comprendre|Parler|Lire|Écrire/ });
for (let i = 0; i < 4; i++) await groups.nth(i).getByRole('radio').nth(1).click();
await page.getByRole('button', { name: /^Continuer$/ }).click();
await page.getByRole('button', { name: /Construire mon parcours/ }).click();
await page.waitForURL(/#\/$/);
// un peu d'activité pour que les écrans aient de la matière : quelques mots acquis, une compréhension, une note de micro
await page.evaluate(() => {
  const st = window.__langueStore.getState();
  const ids = Object.keys(window.__langueItems ?? {}).slice(0, 0);
  void ids;
  st.recordActivity('comp:d:market', 4, 5);
  st.recordPronunciation('w:สวัสดี', 8);
  for (const id of ['c:ก', 'c:ข', 'c:ค', 'c:ง', 'c:จ', 'c:ด', 'c:ต', 'c:บ', 'c:ป', 'c:อ']) { st.answer(id, true); st.answer(id, true); }
});
await page.waitForTimeout(600);
const shot = async (url, name) => { await page.goto(BASE + '/#' + url); await page.waitForTimeout(700); await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); console.log('✓', name); };
await shot('/', 'home');
await shot('/profile/progress', 'progress');
await shot('/profile', 'profile');
await shot('/path', 'path');
await shot('/profile/settings?tab=voice', 'settings-voice');
await shot('/profile/settings?tab=exercises', 'settings-exercises');
await shot('/explore', 'explore');
await browser.close();
