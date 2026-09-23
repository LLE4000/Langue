/**
 * Parcours de bout en bout : onboarding → accueil → première leçon complète → leçon suivante débloquée →
 * rechargement (reprise) → révision → exploration → export.
 */
import { test, expect, type Page } from '@playwright/test';

async function onboard(page: Page, levels: number[] = [0, 0, 0, 0], goal: 'both' | 'speak' | 'read' = 'both') {
  await page.goto('/#/onboarding');
  await page.getByPlaceholder('Prénom').fill('Lucien');
  await page.getByRole('button', { name: /Un homme/ }).click();
  await page.getByRole('button', { name: /Continuer/ }).click();
  // objectif
  await expect(page.getByText('Votre objectif')).toBeVisible();
  await page.getByRole('radio', { name: goal === 'both' ? /Parler, lire et écrire/ : goal === 'speak' ? /Parler et comprendre/ : /^Lire et écrire/ }).click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  // niveaux : seulement les compétences concernées par l'objectif
  const groups = page.getByRole('radiogroup');
  const n = goal === 'both' ? 4 : 2;
  await expect(groups).toHaveCount(n);
  const wanted = goal === 'both' ? levels : goal === 'speak' ? levels.slice(0, 2) : levels.slice(2);
  for (let i = 0; i < n; i++) await groups.nth(i).getByRole('radio').nth(wanted[i]).click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await page.getByRole('button', { name: /Construire mon parcours/ }).click();
  await expect(page).toHaveURL(/#\/$/);
  // Le test pilote lui-même le bouton « Continuer » : on coupe l'avance automatique pour éviter les courses.
  await page.evaluate(() => (window as unknown as { __langueStore: { getState(): { updateSettings(p: object): void } } }).__langueStore.getState().updateSettings({ autoAdvance: false }));
}

/** Répond à toutes les questions d'une étape en choisissant la bonne réponse (les propositions justes portent .ok après clic). */
async function completeLesson(page: Page) {
  for (let guard = 0; guard < 400; guard++) {
    if (await page.getByText(/Leçon validée|Entraînement terminé|Pas encore acquis/).isVisible().catch(() => false)) return;
    // théorie, dialogue, lecture, correction d'une question : partout le même bouton « Continuer »
    const readBtn = page.getByRole('button', { name: /^Continuer$/ });
    if (await readBtn.isVisible().catch(() => false)) { await readBtn.click(); continue; }
    // flashcards
    const reveal = page.getByRole('button', { name: /^Voir la réponse$/ });
    if (await reveal.isVisible().catch(() => false)) { await reveal.click(); await page.locator('.rate button[data-q="3"]').click(); continue; }
    // questions : on lit la bonne réponse dans le magasin d'état exposé (window.__langueStore)
    const info = await page.evaluate(() => {
      const w = window as unknown as { __langueStore: { getState(): { session: { index: number; steps: { type: string; questions?: { choices: { thai?: string; rom?: string; text?: string; ok: boolean }[]; spell?: { target: string } }[] }[] } | null } } };
      const s = w.__langueStore.getState().session; if (!s) return null;
      const step = s.steps[s.index]; if (step.type !== 'questions') return null;
      const R = (x?: string) => (x ?? '').replace(/\{P\}/g, 'ครับ').replace(/\{Q\}/g, 'ครับ').replace(/\{I\}/g, 'ผม').replace(/\{p\}/g, 'khráp').replace(/\{q\}/g, 'khráp').replace(/\{i\}/g, 'phǒm');
      return step.questions!.map((q) => ({ labels: q.choices.map((c) => [R(c.thai), R(c.rom), R(c.text)].filter(Boolean).join(' ').trim()), okIndex: q.choices.findIndex((c) => c.ok), spell: q.spell?.target }));
    });
    const spell = page.locator('.tiles-spell');
    if (info && (await spell.isVisible().catch(() => false))) {
      const hint = (await page.locator('.stage').innerText()).trim();
      const q = info.find((x) => x.spell && hint.length) ?? info.find((x) => x.spell);
      if (q?.spell) for (const ch of [...q.spell]) { const b = spell.locator('button:not(.used)', { hasText: ch }).first(); if (await b.count()) await b.click(); }
      const nextBtn = page.locator('.qfoot .btn');
      if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) { await nextBtn.click(); continue; }
      await page.getByRole('button', { name: 'Effacer' }).click().catch(() => {});
      continue;
    }
    const choices = page.locator('.choices:not(.lock) .choice');
    const n = await choices.count();
    if (n > 0 && info) {
      const texts: string[] = [];
      for (let k = 0; k < n; k++) texts.push((await choices.nth(k).innerText()).replace(/\s+/g, ' ').trim());
      const norm = (x: string) => x.replace(/\s+/g, ' ').trim();
      const q = info.find((x) => x.labels.length === n && x.labels.every((l) => texts.some((tx) => norm(tx) === norm(l) || (l && tx.includes(l)))));
      const okLabel = q ? q.labels[q.okIndex] : null;
      const idx = okLabel ? texts.findIndex((tx) => norm(tx) === norm(okLabel) || tx.includes(okLabel)) : 0;
      await choices.nth(Math.max(0, idx)).click();
      await page.locator('.qfoot .btn').click();
      continue;
    }
    // associer : chaque bouton porte data-pair (identifiant de l'élément) des deux côtés
    if ((await page.locator('.pr:not(.ok)').count()) > 0) {
      const cols = page.locator('.pr').locator('xpath=..');
      const leftCol = cols.first(), rightCol = cols.last();
      for (let a = 0; a < 8; a++) {
        const left = leftCol.locator('.pr:not(.ok)').first();
        if (!(await left.count())) break;
        const id = await left.getAttribute('data-pair');
        await left.click();
        await rightCol.locator(`.pr[data-pair="${id}"]`).click();
        await page.waitForTimeout(150);
      }
      await page.waitForTimeout(800);
      continue;
    }
    // construire la phrase : cliquer les mots puis vérifier
    const toks = page.locator('.tline').nth(1).locator('.tok:not(.used)');
    if ((await toks.count()) > 0) {
      while ((await page.locator('.tline').nth(1).locator('.tok:not(.used)').count()) > 0) await page.locator('.tline').nth(1).locator('.tok:not(.used)').first().click();
      await page.getByRole('button', { name: 'Vérifier' }).click();
      await page.locator('.qfoot .btn').click();
      continue;
    }
    // répéter (facultatif)
    for (const name of [/^Passer$/, /^Terminer$/]) {
      const b = page.getByRole('button', { name });
      if (await b.isVisible().catch(() => false)) { await b.click(); break; }
    }
    await page.waitForTimeout(120);
  }
}

test('onboarding, première leçon, déblocage, reprise, révision', async ({ page }) => {
  await onboard(page);
  await expect(page.getByText('Prochaine leçon')).toBeVisible();
  const first = page.locator('a.cta');
  const firstTitle = await first.locator('.t').innerText();
  await first.click();
  await expect(page).toHaveURL(/#\/lesson\//);
  await completeLesson(page);
  await expect(page.getByText(/Leçon validée|Pas encore acquis/)).toBeVisible();
  // leçon suivante proposée
  const nextBtn = page.getByRole('button', { name: /Leçon suivante/ });
  const retry = page.getByRole('button', { name: /Refaire la leçon/ });
  if (await nextBtn.isVisible().catch(() => false)) await page.getByRole('button', { name: /Retour à l’accueil/ }).click();
  else { await expect(retry).toBeVisible(); await page.getByRole('button', { name: /Retour à l’accueil/ }).click(); }
  await expect(page).toHaveURL(/#\/$/);
  // progression persistée (on laisse l'écriture IndexedDB se terminer avant de recharger)
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByText('Prochaine leçon')).toBeVisible();
  const secondTitle = await page.locator('a.cta .t').innerText();
  expect(secondTitle).not.toBe(firstTitle);
  // parcours
  await page.getByRole('link', { name: /Mon parcours/ }).click();
  await expect(page.locator('.lrow.ok').first()).toBeVisible();
  // révision : des éléments existent désormais
  await page.getByRole('link', { name: 'Réviser' }).click();
  await expect(page.getByText(/dans votre mémoire de révision/)).toBeVisible();
  // exploration
  await page.getByRole('link', { name: 'Explorer' }).click();
  await page.getByRole('link', { name: /Alphabet/ }).click();
  await expect(page.locator('.cell').first()).toBeVisible();
  await page.locator('.cell').first().click();
  await expect(page.locator('.sheet')).toBeVisible();
  // profil et export
  await page.goto('/#/profile/data');
  await expect(page.getByRole('button', { name: /Exporter mes données/ })).toBeVisible();
});

test('reprise d’une leçon après rechargement', async ({ page }) => {
  await onboard(page, [3, 3, 0, 0]);
  await expect(page.getByText(/Prochaine leçon/)).toBeVisible();
  // parle déjà : la première leçon est une leçon d'écriture
  await expect(page.locator('a.cta .t')).toContainText(/consonnes/i);
  await page.locator('a.cta').click();
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await expect(page.locator('.sess .n')).toContainText('2 /');
  await page.reload();
  await expect(page.locator('.sess .n')).toContainText('2 /');
  await page.goto('/#/');
  await expect(page.getByText('Reprendre la leçon')).toBeVisible();
});

test('lecteur confirmé : l’écriture est acquise, on commence par parler', async ({ page }) => {
  await onboard(page, [0, 0, 4, 4]);
  await expect(page.locator('a.cta .k')).toContainText('Prochaine leçon');
  await expect(page.locator('a.cta .t')).toContainText('Salutations');
});

test('objectif « parler » : aucune leçon d’écriture dans le parcours, phonétique toujours affichée', async ({ page }) => {
  await onboard(page, [0, 0, 0, 0], 'speak');
  await expect(page.locator('a.cta .t')).toContainText('Salutations');
  await page.getByRole('link', { name: /Mon parcours/ }).click();
  await expect(page.locator('.lrow').first()).toBeVisible();
  await expect(page.getByText(/consonnes et la voyelle/)).toHaveCount(0);
  await page.goto('/#/profile/settings');
  await expect(page.locator('.seg button.on', { hasText: 'Toujours' })).toBeVisible();
  // l'objectif se change dans Profil
  await page.goto('/#/profile/levels');
  await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
  await expect(page.getByRole('radiogroup')).toHaveCount(5);
  await page.getByRole('button', { name: /Recalculer mon parcours/ }).click();
  await page.getByRole('link', { name: /Mon parcours/ }).click();
  await expect(page.getByText(/consonnes et la voyelle/).first()).toBeVisible();
});

test('duel sur un écran : deux moitiés, le point va au premier qui touche juste', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/play/duel');
  await expect(page.getByText(/Deux personnes, un appareil/)).toBeVisible();
  await page.getByRole('button', { name: /Lancer le duel/ }).click();
  await expect(page.locator('.duel .half')).toHaveCount(2);
  const score0 = page.locator('.half.p0 .score-pill');
  await expect(score0).toHaveText('0');
  await page.locator('.half.p0 .choice[data-ok="1"]').dispatchEvent('pointerdown');
  await expect(score0).toHaveText('1');
  await expect(page.locator('.half.p0')).toHaveClass(/won/);
  // manche suivante après la pause
  await expect(page.locator('.duel .mid')).toContainText('2 /', { timeout: 4000 });
  // une erreur bloque le joueur pour la manche, l'autre peut encore marquer
  await page.locator('.half.p0 .choice[data-ok="0"]').first().dispatchEvent('pointerdown');
  await page.locator('.half.p1 .choice[data-ok="1"]').dispatchEvent('pointerdown');
  await expect(page.locator('.half.p1 .score-pill')).toHaveText('1');
});

test('défi à distance : le lien rejoue exactement la même série', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/play/defi/new');
  await page.getByRole('button', { name: /Je joue ma série/ }).click();
  for (let k = 0; k < 40; k++) {
    if (await page.getByText('Défi prêt').isVisible().catch(() => false)) break;
    const cont = page.getByRole('button', { name: /^Continuer$/ });
    if (await cont.isVisible().catch(() => false)) { await cont.click(); continue; }
    const ch = page.locator('.choices:not(.lock) .choice');
    if (await ch.count()) { await ch.first().click(); continue; }
    await page.waitForTimeout(100);
  }
  await expect(page.getByText('Défi prêt')).toBeVisible();
  const code = ((await page.locator('details code').textContent()) ?? '').trim();
  expect(code.startsWith('1')).toBe(true);
  // le défi apparaît dans « Mes défis », en attente
  await page.goto('/#/play/defi');
  await expect(page.getByText(/en attente de réponse/)).toBeVisible();
  // ouvrir le lien comme le ferait l'autre personne
  await page.goto(`/#/play/defi/${encodeURIComponent(code)}`);
  await expect(page.getByText(/C’est votre propre défi/)).toBeVisible();
  await page.getByRole('button', { name: /Relever le défi/ }).click();
  await expect(page.locator('.stage')).toBeVisible();
  await expect(page.locator('.choices .choice')).toHaveCount(4);
});
