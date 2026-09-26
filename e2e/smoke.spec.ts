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
  // niveaux : repliés derrière « J'ai déjà des bases » ; seulement les compétences concernées par l'objectif
  await page.getByRole('button', { name: /déjà des bases/ }).click();
  const groups = page.getByRole('radiogroup', { name: /Comprendre|Parler|Lire|Écrire/ });
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
    for (const name of [/^Passer l’exercice$/, /^Terminer$/, /^Mot suivant$/]) {
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
  await expect(page.locator('.lrow.done').first()).toBeVisible();
  // révision : des éléments existent désormais
  await page.getByRole('link', { name: 'Réviser' }).click();
  await expect(page.getByText(/dans votre mémoire de révision/)).toBeVisible();
  // bibliothèque
  await page.getByRole('link', { name: 'Bibliothèque', exact: true }).click();
  await page.getByRole('link', { name: /Alphabet/ }).click();
  await expect(page.locator('.cell').first()).toBeVisible();
  await page.locator('.cell').first().click(); // premier toucher : le son et l'aperçu
  await expect(page.locator('.peek')).toBeVisible();
  await page.locator('.cell').first().click(); // second toucher : la fiche
  await expect(page.locator('.sheet')).toBeVisible();
  // profil et export
  await page.goto('/#/profile/data');
  await expect(page.getByRole('button', { name: /Exporter une sauvegarde/ })).toBeVisible();
});

test('reprise d’une leçon après rechargement', async ({ page }) => {
  await onboard(page, [3, 3, 0, 0]);
  await expect(page.getByText(/Prochaine leçon/)).toBeVisible();
  // parle déjà : la première leçon est une leçon d'écriture
  await expect(page.locator('a.cta .t')).toContainText(/consonnes/i);
  await page.locator('a.cta').click();
  // une seule barre de progression : elle avance après la première étape et reste au même endroit après rechargement
  const bar = page.getByRole('progressbar');
  await expect(bar).toHaveAttribute('aria-valuenow', '0');
  await page.getByRole('button', { name: /^Continuer$/ }).click();
  await expect(bar).not.toHaveAttribute('aria-valuenow', '0');
  const at = await bar.getAttribute('aria-valuenow');
  await page.reload();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', at ?? '');
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
  await expect(page.locator('.lrow.k-letters, .lrow.k-vowels, .lrow.k-tones')).toHaveCount(0);
  await expect(page.locator('.lrow.k-vocab').first()).toBeVisible();
  await page.goto('/#/profile/settings?tab=exercises');
  await expect(page.locator('.seg button.on', { hasText: 'Toujours' })).toBeVisible();
  // l'objectif se change dans Profil
  await page.goto('/#/profile/levels');
  await page.getByRole('radio', { name: /Parler, lire et écrire/ }).click();
  await expect(page.getByRole('radiogroup')).toHaveCount(5);
  await page.getByRole('button', { name: /Recalculer mon parcours/ }).click();
  await page.getByRole('link', { name: /Mon parcours/ }).click();
  await expect(page.locator('.lrow.k-letters').first()).toBeVisible();
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

test('alphabet : un toucher lit la lettre et montre l’aperçu, un second ouvre la fiche', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/explore/alphabet');
  const cell = page.locator('.lgrid .cell', { hasText: 'ก' }).first();
  await cell.click();
  await expect(page.locator('.peek')).toBeVisible();
  await expect(page.locator('.peek')).toContainText('poulet');
  await expect(page.locator('.sheet')).toHaveCount(0);
  await cell.click();
  await expect(page.locator('.sheet')).toBeVisible();
  await expect(page.locator('.sheet .rate')).toBeVisible();
});

test('écoute en boucle : sélection de deux lettres proches depuis l’alphabet, réglages persistants', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/explore/alphabet');
  await page.getByText(/Sons voisins à l’oreille/).click(); // section repliée
  await page.getByRole('link', { name: /b · p · ph/ }).click();
  await expect(page).toHaveURL(/explore\/listen/);
  await expect(page.locator('.listen-stage .tag')).toHaveText('1 / 4');
  await expect(page.locator('.chip.on', { hasText: 'Ma sélection' })).toContainText('Ma sélection · 4');
  // ne garder que ป et พ
  await page.locator('.lgrid .cell.sel', { hasText: 'บ' }).click();
  await page.locator('.lgrid .cell.sel', { hasText: 'ผ' }).click();
  await expect(page.locator('.listen-stage .tag')).toHaveText('1 / 2');
  await page.getByText(/^Réglages/).click(); // repli des réglages
  await page.locator('.seg button', { hasText: /^Son / }).click();
  await page.locator('.seg button', { hasText: '+ lent + très lent' }).click();
  await expect(page.locator('.takes .take')).toHaveCount(3);
  await page.getByTestId('listen-play').click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause' }).click();
  // les réglages sont mémorisés
  await page.reload();
  await expect(page.locator('.listen-stage .tag')).toHaveText('1 / 2');
  await expect(page.locator('.takes .take')).toHaveCount(3);
  // suivant / précédent
  await page.getByRole('button', { name: 'Suivant' }).click();
  await expect(page.locator('.listen-stage .tag')).toHaveText('2 / 2');
});

test('duel de prononciation : chacun dit le mot à son tour, résultats mot par mot', async ({ page, context }) => {
  // Moteur de reconnaissance simulé : il « entend » exactement le mot affiché.
  await context.addInitScript(() => {
    class FakeSR {
      lang = ''; maxAlternatives = 1; interimResults = false; continuous = false;
      onresult: ((e: unknown) => void) | null = null; onerror: ((e: unknown) => void) | null = null; onend: (() => void) | null = null;
      start() {
        setTimeout(() => {
          const heard = (document.querySelector('.stage .th')?.textContent ?? '').trim();
          const alt = { transcript: heard, confidence: 0.9 };
          const res = Object.assign([alt], { item: () => alt, isFinal: true });
          this.onresult?.({ results: Object.assign([res], { item: () => res }) });
          this.onend?.();
        }, 150);
      }
      stop() { this.onend?.(); }
    }
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition = FakeSR;
    (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition = FakeSR;
  });
  await onboard(page);
  await page.goto('/#/play');
  await page.getByRole('link', { name: /Duel de prononciation/ }).click();
  await expect(page.getByText(/le plus clair/)).toBeVisible();
  await page.locator('.seg button', { hasText: /^3$/ }).click();
  await page.getByRole('button', { name: /À vos micros/ }).click();
  for (let round = 0; round < 6; round++) {
    await page.getByTestId('voice-go').click();
    await page.getByTestId('voice-say').click();
    await expect(page.locator('.pron .cring b')).toHaveText('10');
    await page.getByTestId('voice-next').click();
  }
  await expect(page.getByText('Résultats')).toBeVisible();
  await expect(page.locator('.vgrid .vscore')).toHaveCount(6);
  await expect(page.locator('.vgrid .vscore.ok')).toHaveCount(6);
  await expect(page.getByText('à égalité')).toBeVisible();
});

test('compréhension orale : écouter sans texte, répondre en français, voir le texte à la fin', async ({ page }) => {
  await onboard(page);
  await page.goto('/#/explore/comprehension');
  await expect(page.getByText(/Une conversation, deux voix/)).toBeVisible();
  await page.getByRole('link', { name: /Commander un café/ }).click();
  await expect(page.getByTestId('comp-play')).toBeVisible();
  await expect(page.locator('.bub')).toHaveCount(0); // pas de texte pendant l'écoute
  await page.getByRole('button', { name: /Passer aux questions/ }).click();
  for (let k = 0; k < 8; k++) {
    if (await page.getByText(/Le texte de la conversation/).isVisible().catch(() => false)) break;
    await expect(page.locator('.choices .choice').first()).toBeVisible();
    const q = await page.locator('.qprompt').innerText();
    // on répond juste à la question rédigée connue, au hasard sinon
    const target = /Que commande/.test(q) ? page.locator('.choices .choice', { hasText: 'Un café glacé' }) : page.locator('.choices .choice').first();
    await target.click();
    await page.locator('.qfoot .btn').click();
  }
  await expect(page.getByText(/Le texte de la conversation/)).toBeVisible();
  await expect(page.locator('.bub').first()).toBeVisible();
  await expect(page.locator('.recap .score')).toBeVisible();
});

test('progression : pastille permanente, palier avec critères chiffrés, jauge de maîtrise sans total de leçons', async ({ page }) => {
  await onboard(page, [1, 1, 1, 1]);
  // la pastille est visible sur l'accueil et mène à l'écran de progression
  const pill = page.getByTestId('progress-pill');
  await expect(pill).toContainText('A0');
  await pill.click();
  await expect(page).toHaveURL(/#\/profile\/progress$/);
  await expect(page.getByText('Premiers pas').first()).toBeVisible();
  await expect(page.getByText(/Pour atteindre A1/)).toBeVisible();
  await expect(page.getByText(/il faut \d+ consonnes/)).toBeVisible();
  // ni total de leçons ni estimation de durée : seulement le pourcentage de maîtrise
  await expect(page.getByText(/soit .* avant A1/)).toHaveCount(0);
  await page.goto('/#/path');
  await expect(page.getByRole('progressbar', { name: /A0 · \d+ % du chemin vers A1/ })).toBeVisible();
  await expect(page.getByText(/sur \d+$|validées? sur/)).toHaveCount(0);
  // les compétences hors objectif « parler » disparaissent du palier
  await page.goto('/#/profile/levels');
  await page.getByRole('radio', { name: /Parler et comprendre/ }).click();
  await page.getByRole('button', { name: /Recalculer mon parcours/ }).click();
  await page.goto('/#/profile/progress');
  await expect(page.getByRole('link', { name: /^Vocabulaire/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /^Consonnes/ })).toHaveCount(0);
  // réglages : trois onglets, dépannage replié
  await page.goto('/#/profile/settings?tab=voice');
  await expect(page.getByRole('tab')).toHaveCount(3);
  await expect(page.getByText('Je préfère entendre')).toBeVisible();
  await expect(page.getByText('Copier le diagnostic')).toBeHidden();
  await page.getByText('La voix pose problème ?').click();
  await expect(page.getByText('Copier le diagnostic')).toBeVisible();
});

test('navigation : quatre onglets, le profil s’ouvre sur le prénom, le mot thaï des titres se prononce', async ({ page }) => {
  await onboard(page);
  const tabs = page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link');
  await expect(tabs).toHaveText(['Leçons', 'Réviser', 'Défis', 'Bibliothèque']);
  // le prénom, en haut à gauche de l'accueil, mène au profil (qui n'est plus un onglet)
  await page.getByRole('link', { name: /Mon profil : Lucien/ }).click();
  await expect(page).toHaveURL(/#\/profile$/);
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page).toHaveURL(/#\/$/);
  // l'onglet Défis ouvre les jeux à plusieurs ; le titre porte son mot thaï
  await tabs.filter({ hasText: 'Défis' }).click();
  await expect(page).toHaveURL(/#\/play$/);
  await expect(page.getByRole('link', { name: /Duel sur un écran/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Écouter ท้าทาย/ })).toBeVisible();
  // l'accueil n'affiche plus « Jouer à plusieurs », mais la suite du parcours
  await tabs.filter({ hasText: 'Leçons' }).click();
  await expect(page.getByText('Jouer à plusieurs')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Mon parcours complet/ })).toBeVisible();
});

test('lire à voix haute : programme, tapis de lecture (sans micro : un toucher avance), bilan', async ({ page }) => {
  await onboard(page);
  await page.getByRole('link', { name: 'Lire à voix haute' }).click();
  await expect(page).toHaveURL(/#\/read$/);
  await expect(page.getByText('Le programme')).toBeVisible();
  await page.getByRole('button', { name: /Commencer la séance/ }).click();
  await expect(page).toHaveURL(/#\/read\/ra-01/);
  await page.getByRole('button', { name: /Démarrer · 35 lectures/ }).click();
  await expect(page.locator('.ra-count')).toHaveText('1 / 35');
  for (let k = 0; k < 5; k++) { await page.locator('.ra-stage').click(); await page.waitForTimeout(120); }
  await expect(page.locator('.ra-count')).toHaveText('6 / 35');
  await page.getByRole('button', { name: /Terminer et voir le bilan/ }).click();
  await expect(page.getByText('La séquence')).toBeVisible();
  await expect(page.getByRole('button', { name: /Retour au programme/ })).toBeVisible();
});
