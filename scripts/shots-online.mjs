// Partie en ligne complète à deux (deux navigateurs) contre un serveur local, avec captures de chaque phase.
// Préalable : cd server && npx wrangler dev --var ALLOWED_ORIGINS:'*' ; appli construite avec VITE_SERVER_URL=http://127.0.0.1:8787
// Usage : BASE=http://localhost:4175 node scripts/shots-online.mjs
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:4175';
const OUT = process.env.OUT ?? 'scripts/out/online';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium' });

async function player(name, scheme) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR', colorScheme: scheme });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(name, 'PAGE ERROR', e.message));
  await page.goto(BASE + '/#/onboarding');
  await page.getByPlaceholder('Prénom').fill(name);
  await page.getByRole('button', { name: /Un homme/ }).click();
  await page.getByRole('button', { name: /Continuer/ }).click();
  await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.getByRole('button', { name: /Construire mon parcours/ }).click();
  await page.waitForURL(/#\/$/);
  return page;
}
const shot = (page, n) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true });

const a = await player('Alice', 'light');
const b = await player('Bob', 'dark');
await a.goto(BASE + '/#/play');
await shot(a, '00-play-hub');
const row = a.getByRole('link', { name: /En ligne, en direct/ });
if (await row.count()) await row.click(); else await a.goto(BASE + '/#/play/online');
await shot(a, '01-online-hub');
await a.getByRole('button', { name: /Créer une salle/ }).click();
await a.waitForURL(/#\/play\/online\/[A-Z]{5}$/);
const code = a.url().split('/').pop();
console.log('salle', code);
await a.getByText('Code de la salle').waitFor();
await shot(a, '02-lobby-alone');
await b.goto(BASE + '/#/play/online');
await b.getByLabel('Code de la salle').fill(code.toLowerCase());
await b.getByRole('button', { name: 'Rejoindre' }).click();
await b.getByText(/L’hôte choisit les mots/).waitFor();
await a.getByRole('button', { name: /Lancer la partie · 2 joueurs/ }).waitFor();
await shot(a, '03-lobby-host');
await shot(b, '04-lobby-guest');
await a.getByRole('button', { name: /Nombres/ }).click();
await a.getByRole('button', { name: /Lancer la partie/ }).click();
await a.locator('.on-count').waitFor();
await shot(b, '05-countdown');
for (let i = 0; i < 10; i++) {
  await a.locator('.on-round .choice').first().waitFor();
  await b.locator('.on-round .choice').first().waitFor();
  if (i === 0) await shot(a, '06-question');
  // Alice touche la bonne réponse (repérée via la série décodée), Bob répond au hasard après un temps
  await a.locator('.on-round .choice').nth(i % 4).click();
  if (i === 0) await shot(a, '07-answered');
  await b.waitForTimeout(300 + (i % 3) * 400);
  await b.locator('.on-round .choice').nth((i + 1) % 4).click();
  await a.locator('.on-round .choices .choice.ok').waitFor();
  if (i === 0) { await shot(a, '08-reveal'); await shot(b, '09-reveal-guest'); }
  if (i === 2) {
    // coupure réseau de Bob pendant la révélation : il doit revenir avec son score
    await b.context().setOffline(true); await b.waitForTimeout(1500); await shot(a, '10-bob-offline'); await b.context().setOffline(false);
  }
  if (i < 9) { await a.locator('.on-round .choices .choice.ok').waitFor({ state: 'detached', timeout: 8000 }); await b.locator('.on-round .choices .choice.ok').waitFor({ state: 'detached', timeout: 8000 }); }
}
await a.getByText(/gagne|Égalité/).waitFor({ timeout: 10000 });
await shot(a, '11-end-host');
await shot(b, '12-end-guest');
await a.getByRole('button', { name: /Revanche/ }).click();
await b.locator('.on-count').waitFor();
console.log('revanche OK');
const hist = await a.evaluate(() => window.__langueStore.getState().history.slice(0, 2).map((h) => h.label));
console.log('historique', hist);
await browser.close();
