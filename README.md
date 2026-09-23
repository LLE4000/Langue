# Langue — apprendre le thaï, un pas après l’autre

Application web progressive (PWA) d’apprentissage des langues, **guidée par un parcours** : l’écran principal répond à une seule question, *« quelle est ma prochaine leçon ? »*. V1 : **français → thaï**. L’architecture est prête pour d’autres couples de langues.

- Fonctionne dans le navigateur, s’installe sur Android / iOS / PC comme une application, marche **hors connexion**.
- **Aucun compte, aucun serveur, aucune clé API** : tout reste sur l’appareil (IndexedDB), avec export / import JSON.
- Audio thaï par la **voix th-TH de l’appareil** (Web Speech API), jamais une voix française qui lit du thaï.
- Un vrai **curriculum avec prérequis** : on ne demande jamais de lire un signe qui n’a pas été enseigné.
- **Niveau par compétence** (comprendre, parler, lire, écrire) : quelqu’un qui parle déjà thaï mais ne lit pas commence par l’écriture, avec des mots qu’il connaît déjà à l’oral.

## Sommaire

1. [Démarrer](#démarrer)
2. [Déployer](#déployer)
3. [La PWA](#la-pwa)
4. [Architecture](#architecture)
5. [Le contenu](#le-contenu)
6. [Le curriculum et le parcours](#le-curriculum-et-le-parcours)
7. [Le moteur pédagogique](#le-moteur-pédagogique)
8. [Système de transcription](#système-de-transcription)
9. [Guides : ajouter une leçon, une langue, une traduction, un type d’exercice](#guides)
10. [Tests](#tests)
11. [Identité visuelle](#identité-visuelle)
12. [Données et vie privée](#données-et-vie-privée)

## Démarrer

Prérequis : Node.js 20 ou plus récent.

```bash
npm install          # dépendances
npm run dev          # serveur de développement (http://localhost:5173)
npm run build        # build de production dans dist/ (typecheck inclus)
npm run preview      # sert dist/ en local (http://localhost:4173)
npm test             # tests unitaires (vitest)
npm run test:e2e     # tests de bout en bout (Playwright, lance le preview tout seul)
npm run lint         # eslint
```

Stack : **Vite + React 19 + TypeScript**, `zustand` (état) + `idb-keyval` (IndexedDB), `react-router-dom` (routage par hash, compatible GitHub Pages), `vite-plugin-pwa` (manifest + service worker Workbox), polices `@fontsource` embarquées pour le hors-ligne : Sarabun (thaï traditionnel à boucles), Kanit (thaï moderne), Plus Jakarta Sans (interface), Instrument Serif (titres).

## Déployer

L’application est un site statique : n’importe quel hébergement gratuit convient (GitHub Pages, Netlify, Cloudflare Pages…).

**GitHub Pages (inclus)** : le workflow `.github/workflows/deploy.yml` construit et publie automatiquement à chaque push sur `main`.
1. GitHub Pages n’est gratuit que pour les dépôts **publics** : réglages du dépôt → *General* → *Danger Zone* → *Change visibility* → Public (ou passer à un forfait payant pour rester privé).
2. Réglages du dépôt → *Pages* → *Source* : **GitHub Actions** (le workflow tente aussi de l’activer lui-même).
3. Fusionner la branche de travail dans `main` (ou pousser sur `main`) : le workflow lance lint, tests, build et publication (≈ 2 minutes).
4. L’application est servie sur `https://<utilisateur>.github.io/<dépôt>/`, par exemple `https://lle4000.github.io/Langue/`.

**Installer sur le téléphone** : ouvrir ce lien dans Chrome (Android) → menu ⋮ → *Installer l’application* (ou *Ajouter à l’écran d’accueil*). Sur iPhone : Safari → Partager → *Sur l’écran d’accueil*. L’application se lance ensuite en plein écran, hors connexion, et se met à jour toute seule quand une nouvelle version est publiée.

Le chemin de base est injecté par la variable `BASE_PATH` (`/<dépôt>/` sur Pages, `/` ailleurs) :

```bash
BASE_PATH=/Langue/ npm run build
```

## La PWA

- `vite.config.ts` déclare le **manifest** (nom, icônes, `display: standalone`, couleur de thème) et la stratégie du **service worker** : tout le bundle (JS, CSS, polices, icônes) est mis en cache à l’installation (*precache*), donc l’application complète fonctionne hors connexion — le contenu pédagogique est dans le bundle.
- Mise à jour : quand une nouvelle version est publiée, une bannière « Nouvelle version disponible » propose de recharger (`useRegisterSW`, mode `prompt`).
- Installation : Chrome Android propose « Ajouter à l’écran d’accueil » ; sur iOS, Partager → « Sur l’écran d’accueil ».
- Ce qui dépend de l’appareil : la **synthèse vocale** (voix thaïe installée dans le système) et la **reconnaissance vocale** (Chrome Android, souvent en ligne). L’application détecte ce qui est disponible et s’adapte ; rien ne bloque sans micro ni voix.
- Icônes : `public/icons/icon.svg` est la source ; `node scripts/make-icons.mjs` régénère les PNG (192, 512, maskable).

## Architecture

```
src/
  app/            coque de l'application : routes, magasin d'état persisté, services (audio), hooks dérivés
  components/     composants réutilisables (texte thaï, audio, feuilles, fiche d'un élément, micro, dialogue, lecture…)
  content/        CONTENU PÉDAGOGIQUE (aucun code d'interface)
    types.ts      types partagés (Localized, Consonant, Vowel, VocabItem…)
    th/           pack thaï : consonants, vowels, tones, numbers, vocabulary, grammar, dialogs, readings, classifiers, gloss, phrasebook…
    th/index.ts   registre des éléments d'apprentissage (ITEMS) + lexique du mot à mot
    packs.ts      registre des couples de langues (fr-th) : langue de synthèse vocale, polices, curriculum
  curriculum/     CURRICULUM (données) : types, pistes th-fr (écriture, conversation, nombres), moteur de parcours
  engine/         moteur linguistique et pédagogique, sans DOM : transcription, règle de ton, prérequis de lecture,
                  répétition espacée & maîtrise, synthèse/reconnaissance vocale, mot à mot, jetons de politesse
  features/       écrans : onboarding, home (Apprendre), lesson (moteur de leçon + étapes), review, explore, profile
  i18n/           textes de l'interface (fr.ts) ; L() résout un texte localisé du contenu
  styles/         feuille de style globale (mobile d'abord, clair/sombre)
e2e/              tests Playwright (mobile, tablette, PC)
scripts/          extraction de la maquette d'origine, génération du contenu, icônes, captures d'écran
```

Séparation des responsabilités :
- **langue de l’interface** : `i18n/` (`T()` pour les textes d’UI) ;
- **langue maternelle** : champs `Localized` du contenu (`{ fr: "…", en?: "…" }`, résolus par `L()`) ;
- **langue cible** : le pack de contenu (`content/th`) + les paramètres audio du pack (`packs.ts`) ;
- **curriculum** : `curriculum/th-fr` (données), indépendant de l’interface ;
- **état** : `app/store.ts` — un seul objet `PersistedState`, sérialisable, exporté/importé tel quel (un futur backend de synchronisation lirait/écrirait ce même objet).

## Le contenu

Tout le contenu de la maquette d’origine a été conservé et structuré (fichiers `src/content/th/*.ts`, générés une première fois par `scripts/gen-content.mjs` puis maintenus à la main) :

| Fichier | Contenu |
|---|---|
| `consonants.ts` | 44 consonnes : nom, sens, classe, sons initial/final, API, notes, ordre d’introduction |
| `vowels.ts` | 42 formes de voyelles : transcription, API, durée, groupe, positions, forme fermée, exemple |
| `tones.ts` | 5 tons, 4 marques, 124 mots analysés (classe, vivante/morte, longueur, marque), 27 séries « même syllabe » |
| `numbers.ts` | chiffres thaïs, unités, nombres clés, remarques |
| `vocabulary.ts` + `vocabularyExtra.ts` | 45 thèmes, ~890 mots et phrases, ~150 phrases d’exemple ; ordre d’utilité des thèmes, groupes de la bibliothèque |
| `grammar.ts` + `grammarExtra.ts` | 34 fiches : règle, schéma, exemples, astuce |
| `dialogs.ts` + `dialogsExtra.ts` | 30 conversations ; dialogue associé à chaque thème |
| `readings.ts` + `readingsExtra.ts` | 19 textes de lecture, 5 niveaux, mot à mot |
| `classifiers.ts` | 21 classificateurs, schémas d’emploi, exercice |
| `gloss.ts` | 240 mots-outils pour le découpage mot à mot |
| `phrasebook.ts` | phrases de voyage à montrer en grand, numéros d’urgence |
| `alphabetExtras.ts`, `phonGuide.ts` | lettres sosies, sons voisins, conseils, guide de transcription |

Les fichiers `*Extra.ts` contiennent le contenu ajouté après la maquette (thèmes Poser des questions, Fruits, Quand ?, Téléphone et internet, Nature, Argent et banque, Loisirs et sport, Fêtes et culture ; exemples des mots essentiels ; dialogues au marché aux fruits, au temple, loisirs, week-end ; lectures À la plage, Au temple, Les fruits du marché ; fiches ยัง, อาจจะ/คง/น่าจะ, ตอน/ก่อน/หลังจาก). Le test `content.test.ts` vérifie l’intégrité de l’ensemble (identifiants, alphabet de transcription, jetons de genre appariés, thèmes couverts par le parcours, dialogues et lectures complets).

Chaque élément apprenable reçoit un **identifiant stable** (`c:ก`, `v:–า`, `w:สวัสดี{P}`, `t:มา`, `n:20`, `k:คน`, `g:polite`, `rule:hnam`, `m:1`) : c’est sur ces identifiants que portent la maîtrise, les prérequis et les leçons.

Jetons résolus selon le profil : `{P}` / `{Q}` particules de politesse (ครับ · ค่ะ/คะ), `{I}` « je » (ผม · ฉัน), `{N}` prénom ; en minuscules pour la transcription.

## Le curriculum et le parcours

Trois **pistes** (`src/curriculum/th-fr/`) :

- **Écriture** (`script.ts`) — 21 étapes + leçons de lecture : ก ด ต บ ป + –า → อ น ม + –ี –ู –อ → ร ล ง ย ว → finales vivantes → เ– แ– โ– → ไ– ใ– เ–า –ำ → les cinq tons → classes → marques ่ ้ (moyenne, puis basse) → จ ส ห ข (classe haute) → syllabes mortes → ค ท พ ช → ห นำ et « o » implicite → ึ ือ เ–อ → diphtongues → ถ ฝ ฉ ซ ฟ ฮ → finales irrégulières, groupes, « a » implicite → voyelles courtes → lettres rares, ◌์, อ นำ → ๊ ๋, chiffres thaïs. Les **mots** de chaque étape sont **choisis automatiquement** dans tout le contenu parmi ceux qui sont lisibles avec les signes déjà enseignés (`engine/thai/reading.ts`) ; les textes de lecture sont greffés dès qu’ils deviennent entièrement lisibles. Un test garantit qu’aucune activité de lecture n’utilise un signe non enseigné.
- **Conversation** (`talk.ts`) — les thèmes de vocabulaire par ordre d’utilité, en leçons de ~7 mots, avec une fiche de grammaire une leçon sur deux et la conversation du thème en fin de thème. Chaque thème porte un **niveau oral** (0–4).
- **Nombres** (`talk.ts`) — 0–10 et chiffres thaïs, 11–99, grands nombres, classificateurs (3 leçons).

Le **moteur de parcours** (`curriculum/path.ts`) :
- marque **acquises** les leçons couvertes par le niveau déclaré (lecture ≥ niveau de l’étape ; oral > niveau du thème) ;
- **entrelace** les pistes selon l’écart entre compétences (qui parle mieux qu’il ne lit reçoit 3 leçons d’écriture pour 1 de conversation, et commence par lire ; un débutant complet commence par « Salutations » puis alterne) ;
- respecte les prérequis ; **chaque leçon validée débloque la suivante, sans limite journalière** ;
- signale les leçons dont le contenu est « déjà connu à l’oral » : les mots y sont présentés comme *« vous connaissez ce mot, apprenons à le lire »*.

Changer ses niveaux (Profil › Mes niveaux) recalcule le parcours sans effacer la maîtrise acquise.

## Le moteur pédagogique

- **Leçon** (`features/lesson/engine.ts`) : les activités déclaratives d’une leçon (`theory`, `flashcard`, `listen`, `read`, `multipleChoice`, `dictation`, `spell`, `syllables`, `toneExercise`, `match`, `build`, `dialog`, `reading`, `repeat`, `review`, `recap`) sont transformées en **étapes sérialisables** avec des questions tirées au sort et des distracteurs cohérents (uniquement des éléments connus). La séance est persistée : après un rechargement, on reprend à la même étape. Une mauvaise réponse revient plus loin dans la série (au plus deux fois). Score ≥ 60 % (paramètre `minScore`) = leçon validée.
- **Passer d’un exercice à l’autre** : chaque étape a la même barre d’action fixée en bas (`components/StepFooter.tsx`), avec le même mot, **Continuer** ; après une bonne réponse la suite arrive seule au bout d’une seconde (jauge visible, réglable dans Profil › Réglages › Avance automatique), après une erreur on lit la correction et on touche Continuer. Au clavier : Entrée ou Espace pour continuer, 1–4 pour choisir. Les flashcards se retournent d’un toucher ; les paires « Associer » se terminent seules.
- **Maîtrise** (`engine/srs.ts`) : répétition espacée de type SM-2 (intervalle, facilité, échéance) alimentée par les exercices (juste/faux, rapidité) et par l’auto-évaluation des flashcards ; la **maîtrise 0–100 %** combine la note atteinte, la régularité des 8 dernières réponses, le nombre de répétitions et l’oubli estimé depuis la dernière révision. Les **règles** (tons, ห นำ, finales…) ont leur propre maîtrise via `ruleKey`.
- **Révision** (`features/review/training.ts`) : la file des éléments dus, et 8 entraînements (Flashcards, Écoute, Lecture rapide, Associer, Dictée, Tons, Quiz, Défi chrono) qui n’utilisent que ce qui a été rencontré / est lisible.
- **Translittération** : réglage *Toujours / Apprentissage / Masquée* ; en mode Apprentissage, la phonétique disparaît sur les mots lisibles avec les lettres déjà apprises et maîtrisées.
- **Audio** (`engine/audio/tts.ts`) : interface `SpeechProvider` ; l’implémentation `WebSpeechProvider` détecte les voix thaïes (gestion des listes tardives de Chrome Android, réveil au premier toucher, choix de la voix, vitesse lente) et refuse de lire du thaï avec une autre langue. Un fournisseur distant (API TTS) se brancherait en implémentant la même interface.
- **Micro** (`engine/audio/mic.ts`) : enregistrement pour se réécouter, reconnaissance th-TH (dit seulement si le moteur a compris le bon mot), point de branchement `PronunciationScorer` pour une future évaluation phonétique (aucun score n’est affiché tant qu’aucun service n’est branché).

## Système de transcription

Une seule convention dans toute l’application, proche de l’API (documentée aussi dans Explorer › Transcription) :

| Transcription | Son | Exemple |
|---|---|---|
| p t k · j | occlusives **sans** souffle ; จ [tɕ] | ป, ต, ก, จ |
| ph th kh · ch | **avec** souffle (jamais « f », jamais le « th » anglais) | พ ผ ภ, ท ถ ธ, ค ข, ช ฉ |
| ng · y · r | [ŋ] (aussi en début de mot), [j], r roulé | ง, ย ญ, ร |
| a i ʉ u e ɛ o ɔ ə | voyelles, **doublées quand longues** (aa, ii…) | ʉ = « ou » lèvres étirées, ə ≈ e de « le » |
| ia · ʉa · ua | diphtongues | เ–ีย, เ–ือ, –ัว |
| a · à · â · á · ǎ | ton moyen · bas · descendant · haut · montant | มา · ไก่ · ข้าว · น้ำ · หมา |
| -p -t -k | finales bloquées | มาก, รัก |

L’API et le RTGS affichés dans les fiches sont **dérivés** de cette transcription (`engine/thai/transcription.ts`). Les tons de chaque syllabe sont calculés à partir de la transcription ; pour les mots analysés (`tones.ts`), un test vérifie que la règle de ton (`toneRule`) redonne bien le ton de la transcription.

## Guides

### Ajouter une leçon

Une leçon est un objet `LessonDef` (`src/curriculum/types.ts`) : identifiant, piste, unité, titre, compétences, **prérequis**, **nouvelles notions** (identifiants d’éléments), **activités** (données), durée, niveau oral/lecture, score minimal.

- Leçon d’écriture : ajouter une étape dans `STAGES` (`curriculum/th-fr/script.ts`) — lettres, voyelles, marques, règles introduites, textes. Les mots lisibles et les exercices sont générés ; le test `curriculum.test.ts` vérifie la lisibilité.
- Leçon de vocabulaire : ajouter des mots à un thème (`content/th/vocabulary.ts`) ; les leçons du thème se régénèrent (7 mots par leçon). Un nouveau thème s’ajoute à `THEME_ORDER` et à `THEME_ORAL` (niveau oral) / `THEME_UNIT` dans `talk.ts`.
- Leçon sur mesure : pousser un `LessonDef` explicite dans `buildCurriculum()` (`curriculum/th-fr/index.ts`), par exemple :

```ts
{
  id: 'talk-custom-1', track: 'talk', unit: 'u-talk-2', title: { fr: 'Au café' }, skills: ['listening', 'speaking'],
  prerequisites: ['talk-drink-1'], newConcepts: ['w:กาแฟ', 'w:ชา', 'g:ask'], minutes: 8, oralLevel: 1, minScore: 0.6,
  activities: [
    { type: 'theory', blocks: [{ kind: 'text', text: { fr: '…' } }, { kind: 'words', ids: ['w:กาแฟ', 'w:ชา'] }, { kind: 'grammar', grammarId: 'g:ask' }] },
    { type: 'flashcard', items: ['w:กาแฟ', 'w:ชา'] },
    { type: 'listen', items: ['w:กาแฟ', 'w:ชา'] },
    { type: 'dialog', id: 'd:cafe' },
    { type: 'recap' },
  ],
}
```

### Ajouter une langue cible (ex. arabe)

1. Créer `src/content/ar/` avec les mêmes types (`content/types.ts`) — adapter ce qui est propre à la langue (pas de classes de consonnes, écriture de droite à gauche…). Le registre `ITEMS` de `content/ar/index.ts` doit fournir les mêmes exports que `content/th/index.ts`.
2. Créer un curriculum `src/curriculum/ar-fr/` qui renvoie un `Curriculum` (unités + leçons).
3. Enregistrer le pack dans `src/content/packs.ts` : `speechLang: 'ar-EG'`, `langBase: 'ar'`, expression régulière des noms de voix, polices, `loadCurriculum`.
4. Les analyseurs spécifiques au thaï (`engine/thai/*`) ne servent qu’au pack thaï ; une autre écriture aura son propre module `engine/<langue>/reading.ts` (prérequis de lecture) si l’on veut le même garde-fou « jamais un signe non enseigné ».

### Ajouter une langue maternelle / d’interface (ex. anglais)

1. Interface : copier `src/i18n/fr.ts` en `en.ts`, traduire, l’enregistrer dans `src/i18n/index.ts` (`DICTS`).
2. Contenu : ajouter la clé `en` aux champs `Localized` (`{ fr: 'poulet', en: 'chicken' }`) — les champs non traduits retombent sur le français.
3. Déclarer le pack `en-th` dans `packs.ts`.

### Ajouter un type d’exercice

1. Déclarer la spécification dans `ActivitySpec` (`curriculum/types.ts`), par exemple `{ type: 'fillBlank'; sentences: string[] }`.
2. Générer l’étape dans `planActivity()` (`features/lesson/engine.ts`) : soit une étape `questions` avec un nouveau `kind` de `Question` (affichée par `QuestionsStep` — ajouter le rendu si besoin), soit un nouveau type de `RuntimeStep` avec son composant dans `features/lesson/steps/` branché dans `LessonRunner.tsx`.
3. Enregistrer les réponses via `useStore().answer(itemId, ok, seconds, ruleKey)` pour alimenter la maîtrise, et renvoyer `{ ok, total, xp, wrong }` à `onDone`.

## Tests

- **Unitaires** (`npm test`, 45 tests) : transcription → API/RTGS, règle de ton (cohérence des 124 mots analysés), composition des nombres, SRS/maîtrise, jetons, reconnaissance vocale, **prérequis de lecture** (`reading.test.ts`), curriculum (identifiants, prérequis, cycles, éléments référencés, **jamais un signe non enseigné**, placement de toutes les lectures), parcours personnalisé (débutant, locuteur non lecteur, lecteur non locuteur, déblocage), moteur de leçon (planification, distracteurs de la première leçon), **intégrité du contenu** (`content.test.ts`).
- **Bout en bout** (`npm run test:e2e`, Playwright sur Pixel 7, iPad Mini et PC) : onboarding → première leçon complète → validation → leçon suivante → rechargement → parcours → révision → exploration → export ; reprise d’une leçon après rechargement ; personnalisation du parcours.
- Dans l’environnement de développement distant, Chromium est fourni : `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`.
- **Contrôle visuel** : `node scripts/shots.mjs <dossier>` (après `npm run preview`) prend une vingtaine de captures ; variables `DEVICE=phone|tablet|desktop`, `THEME=light|dark`, `LEVELS=0,0,0,0`.

## Identité visuelle

Papier chaud et encre profonde, un accent safran (robes des moines, guirlandes de soucis), un vert-bleu d’Andaman pour la phonétique ; titres en Instrument Serif, interface en Plus Jakarta Sans, thaï en Sarabun (formes traditionnelles à boucles, celles qu’on apprend à tracer) et Kanit (forme moderne, affichée à côté). Tous les jetons de couleur sont dans `src/styles/app.css` (`:root`), avec leur variante sombre (automatique ou forcée dans les réglages). L’icône source est `public/icons/icon.svg`.

## Données et vie privée

- Tout est local (IndexedDB, clé `langue-v1`). Profil › Mes données : **Exporter** (fichier JSON versionné), **Importer** (fichier ou texte collé), **Réinitialiser**.
- Partager ma progression génère une **image sur l’appareil** (canvas) et utilise le partage natif ; rien n’est envoyé automatiquement à un serveur. Le format d’export est la base prévue pour une future synchronisation ou un mode duel.
- Pour le débogage, le magasin d’état est exposé dans la console : `__langueStore.getState()`.

## Origine

Ce dépôt est la refonte structurée d’une maquette HTML monofichier (« thai-app »). Toutes ses données pédagogiques ont été extraites (`scripts/extract-mockup.mjs`) et ses fonctions utiles réparties dans le parcours (leçons), Réviser (entraînements fusionnés) et Explorer (bibliothèque : alphabet avec lettres sosies et écoute en boucle, voyelles, tons avec séries et tableau des règles, nombres et convertisseur, vocabulaire, conversations, lectures, grammaire, classificateurs, phrases de voyage, écriture au doigt, guide de transcription, recherche).
