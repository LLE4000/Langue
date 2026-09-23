#!/usr/bin/env node
/**
 * Captures d'écran de l'application pour vérification visuelle et documentation.
 *   node scripts/shots.mjs <dossier>      (env : BASE, LEVELS=0,0,0,0, DEVICE=phone|tablet|desktop, THEME=light|dark)
 */
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';

const out = process.argv[2] || 'shots';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {});
const device = process.env.DEVICE === 'tablet' ? devices['iPad Mini'] : process.env.DEVICE === 'desktop' ? { viewport: { width: 1280, height: 800 } } : devices['Pixel 7'];
const ctx = await browser.newContext({ ...device, locale: 'fr-FR', colorScheme: process.env.THEME === 'dark' ? 'dark' : 'light' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
const base = process.env.BASE || 'http://localhost:4173';
const shot = (n) => page.screenshot({ path: `${out}/${n}.png`, fullPage: false });
const settle = (ms = 400) => page.waitForTimeout(ms);

await page.goto(base + '/#/onboarding');
await page.waitForSelector('.welcome');
await shot('01-onboarding');
await page.getByPlaceholder('Prénom').fill('Lucien');
await page.getByRole('button', { name: /Un homme/ }).click();
await page.getByRole('button', { name: /Continuer/ }).click();
await shot('02-levels');
const groups = page.getByRole('radiogroup');
const levels = (process.env.LEVELS || '0,0,0,0').split(',').map(Number);
for (let i = 0; i < 4; i++) await groups.nth(i).getByRole('radio').nth(levels[i]).click();
await page.getByRole('button', { name: /^Continuer$/ }).click();
await page.getByRole('button', { name: /Construire mon parcours/ }).click();
await page.waitForSelector('a.cta');
await page.evaluate(() => window.__langueStore.getState().updateSettings({ autoAdvance: false }));
await shot('03-home');
await page.locator('a.cta').click();
await page.waitForSelector('.view');
await settle();
await shot('04-lesson-theory');
await page.getByRole('button', { name: /^Continuer$/ }).click();
await settle(300);
await shot('05-lesson-flashcard');
await page.getByRole('button', { name: /^Voir la réponse$/ }).click();
await settle(300);
await shot('06-lesson-flashcard-back');
for (let k = 0; k < 14; k++) {
  if (await page.locator('.rate button[data-q="3"]').isVisible().catch(() => false)) { await page.locator('.rate button[data-q="3"]').click(); await settle(150); continue; }
  const reveal = page.getByRole('button', { name: /^Voir la réponse$/ });
  if (await reveal.isVisible().catch(() => false)) { await reveal.click(); await settle(150); continue; }
  break;
}
await settle(300);
await shot('07-lesson-question');
const ch = page.locator('.choices .choice');
if (await ch.count()) { await ch.first().click({ force: true }); await settle(); await shot('08-lesson-feedback'); }
await page.goto(base + '/#/review'); await settle(); await shot('09-review');
await page.goto(base + '/#/explore'); await settle(); await shot('10-explore');
await page.goto(base + '/#/explore/alphabet'); await settle(600); await shot('11-alphabet');
await page.locator('.cell').first().click(); await settle(500); await shot('12-detail');
await page.goto(base + '/#/explore/tones/five'); await settle(500); await shot('13-tones');
await page.goto(base + '/#/profile'); await settle(500); await shot('14-profile');
await page.goto(base + '/#/path'); await settle(500); await shot('15-path');
await page.goto(base + '/#/profile/settings'); await settle(500); await shot('16-settings');
await page.goto(base + '/#/explore/dialogs/d%3Afruits'); await settle(500); await shot('17-dialog');
await page.goto(base + '/#/explore/vocab'); await settle(500); await shot('18-vocab');
await page.goto(base + '/#/explore/vocab/qw'); await settle(500); await shot('19-vocab-theme');
await page.goto(base + '/#/explore/readings/r%3Ar17'); await settle(500); await shot('20-reading');
await browser.close();
console.log('ok', out);
