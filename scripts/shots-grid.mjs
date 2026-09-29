// Grille de lecture : réglages, grille, lecture avec une reconnaissance simulée (elle « entend » la case entourée,
// et se trompe sur une case sur quatre), puis le bilan. Usage : BASE=http://localhost:4174 node scripts/shots-grid.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const BASE = process.env.BASE ?? 'http://localhost:4173', OUT = process.env.OUT ?? 'scripts/out/grid';
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR', colorScheme: process.env.SCHEME ?? 'light' });
await ctx.addInitScript(() => {
  let n = 0;
  class FakeSR { lang = ''; continuous = false; interimResults = false; maxAlternatives = 1; onresult = null; onerror = null; onend = null; onstart = null; timer = 0;
    start() { this.onstart?.(); this.timer = setInterval(() => {
      const cur = document.querySelector('.rg-cell.cur .g')?.textContent?.trim(); if (!cur) return;
      n++; const heard = n % 4 === 0 ? 'มา' : cur;
      // en mode continu, le navigateur accumule les résultats de la session
      const alt = { transcript: heard, confidence: 0.9 }; const res = Object.assign([alt], { item: () => alt, isFinal: true });
      this.all = [...(this.all ?? []), res];
      this.onresult?.({ resultIndex: this.all.length - 1, results: Object.assign([...this.all], { item: (i) => this.all[i] }) });
    }, 700); }
    stop() { clearInterval(this.timer); this.onend?.(); } abort() { this.stop(); } }
  window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
  navigator.mediaDevices.getUserMedia = () => Promise.reject(new Error('pas de micro'));
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('ERR', e.message));
await page.goto(BASE + '/#/onboarding');
await page.getByPlaceholder('Prénom').fill('Lucien');
await page.getByRole('button', { name: /Un homme/ }).click();
await page.getByRole('button', { name: /Continuer/ }).click();
await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
await page.getByRole('button', { name: /^Continuer$/ }).click();
await page.getByRole('button', { name: /Construire mon parcours/ }).click();
await page.waitForURL(/#\/$/);
await page.goto(BASE + '/#/read'); await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/0-hub.png` });
await page.getByRole('link', { name: /Grille de lecture/ }).click();
await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/1-setup.png`, fullPage: true });
await page.getByRole('button', { name: /Hautes/ }).click();
await page.getByRole('button', { name: /Avec/ }).click();
await page.locator('.rg-settings > summary').click();
await page.waitForTimeout(300); await page.screenshot({ path: `${OUT}/2-grid-high.png`, fullPage: true });
await page.locator('.seg button', { hasText: 'Lire seul' }).click();
await page.getByRole('button', { name: /Lire la grille/ }).click();
await page.waitForTimeout(4200); await page.screenshot({ path: `${OUT}/3-reading.png` });
await page.getByText(/justes ·/).waitFor({ timeout: 60000 });
await page.waitForTimeout(800); await page.screenshot({ path: `${OUT}/4-done.png`, fullPage: true });
const cls = await page.locator('.rg-cell').evaluateAll((els) => els.map((e) => e.className.match(/v-\w+/)?.[0] ?? '-'));
console.log(cls.join(' '));
await b.close();
