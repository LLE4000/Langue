#!/usr/bin/env node
/** Génère les icônes PNG (192, 512, maskable 512) à partir de public/icons/icon.svg avec Chromium (Playwright). */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const svg = fs.readFileSync(path.join(root, 'public/icons/icon.svg'), 'utf8');
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {});
const page = await browser.newPage({ deviceScaleFactor: 1 });
async function render(size, file, maskable) {
  const pad = maskable ? 0.1 : 0;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${maskable ? '#0B6B5A' : 'transparent'}"><div style="width:${size}px;height:${size}px;display:grid;place-items:center"><div style="width:${size * (1 - 2 * pad)}px;height:${size * (1 - 2 * pad)}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div></body></html>`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(root, 'public/icons', file), omitBackground: !maskable });
  console.log('✓', file);
}
await render(192, 'icon-192.png', false);
await render(512, 'icon-512.png', false);
await render(512, 'icon-maskable-512.png', true);
await browser.close();
