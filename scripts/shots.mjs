#!/usr/bin/env node
/** Captures d'écran de l'application (mobile) pour vérification visuelle et documentation. */
import { chromium, devices } from '@playwright/test';
import fs from 'node:fs';

const out = process.argv[2] || 'shots';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ ...devices['Pixel 7'], locale: 'fr-FR' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
const base = process.env.BASE || 'http://localhost:4173';
const shot = (n) => page.screenshot({ path: `${out}/${n}.png`, fullPage: false });

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
await shot('03-home');
await page.locator('a.cta').click();
await page.waitForSelector('.view');
await page.waitForTimeout(400);
await shot('04-lesson-theory');
await page.getByRole('button', { name: /J’ai lu, on continue/ }).click();
await page.waitForTimeout(300);
await shot('05-lesson-flashcard');
await page.getByRole('button', { name: /^Voir la réponse$/ }).click();
await page.waitForTimeout(300);
await shot('06-lesson-flashcard-back');
// avancer jusqu'aux questions
for (let k = 0; k < 12; k++) {
  if (await page.locator('.rate button[data-q="3"]').isVisible().catch(() => false)) { await page.locator('.rate button[data-q="3"]').click(); await page.waitForTimeout(150); continue; }
  const reveal = page.getByRole('button', { name: /^Voir la réponse$/ });
  if (await reveal.isVisible().catch(() => false)) { await reveal.click(); await page.waitForTimeout(150); continue; }
  break;
}
await page.waitForTimeout(300);
await shot('07-lesson-question');
const ch = page.locator('.choices .choice');
if (await ch.count()) { await ch.first().click({ force: true }); await page.waitForTimeout(400); await shot('08-lesson-feedback'); }
await page.goto(base + '/#/review'); await page.waitForTimeout(400); await shot('09-review');
await page.goto(base + '/#/explore'); await page.waitForTimeout(400); await shot('10-explore');
await page.goto(base + '/#/explore/alphabet'); await page.waitForTimeout(600); await shot('11-alphabet');
await page.locator('.cell').first().click(); await page.waitForTimeout(500); await shot('12-detail');
await page.goto(base + '/#/explore/tones/five'); await page.waitForTimeout(500); await shot('13-tones');
await page.goto(base + '/#/profile'); await page.waitForTimeout(500); await shot('14-profile');
await page.goto(base + '/#/path'); await page.waitForTimeout(500); await shot('15-path');
await page.goto(base + '/#/profile/settings'); await page.waitForTimeout(500); await shot('16-settings');
await page.goto(base + '/#/explore/dialogs/d%3Amarket'); await page.waitForTimeout(500); await shot('17-dialog');
await browser.close();
console.log('ok', out);
