/** Textes de l'interface — français. Pour ajouter une langue d'interface : copier ce fichier (en.ts) et l'enregistrer dans index.ts. */
export const fr = {
  app: { name: 'Langue', tagline: 'Apprendre le thaï, un pas après l’autre' },
  nav: { learn: 'Apprendre', review: 'Réviser', play: 'Jouer', explore: 'Explorer', profile: 'Profil' },
  common: {
    continue: 'Continuer', start: 'Commencer', next: 'Suivant', check: 'Vérifier', back: 'Retour', close: 'Fermer', quit: 'Quitter', cancel: 'Annuler',
    listen: 'Écouter', slow: 'Lentement', reveal: 'Voir la réponse', correct: 'Correct', wrong: 'Pas tout à fait', goodAnswer: 'Bonne réponse',
    minutes: 'min', new: 'nouveau', known: 'déjà connu', seeAll: 'Tout voir', search: 'Rechercher', loading: 'Chargement…', yes: 'Oui', no: 'Non',
    skip: 'Passer', finish: 'Terminer', again: 'Rejouer', save: 'Enregistrer',
  },
  skills: { listening: 'Comprendre', speaking: 'Parler', reading: 'Lire', writing: 'Écrire' },
  levels: {
    generic: ['Débutant complet', 'A1 · notions', 'A2 · survie', 'B1 · autonome', 'B2+ · à l’aise'],
    reading: ['Je ne lis aucune lettre', 'Je reconnais quelques lettres', 'Je déchiffre lentement', 'Je lis des phrases simples', 'Je lis couramment'],
    writing: ['Je n’écris rien', 'Je trace quelques lettres', 'J’écris des mots simples', 'J’écris des phrases', 'J’écris couramment'],
    listening: ['Je ne comprends rien', 'Quelques mots courants', 'Des phrases simples et lentes', 'Une conversation courante', 'Presque tout'],
    speaking: ['Je ne dis rien', 'Bonjour, merci, compter', 'Me débrouiller (achats, taxi)', 'Tenir une conversation', 'Parler avec aisance'],
  },
  onboarding: {
    welcome: 'Bienvenue', intro: 'Quelques questions pour construire un parcours qui vous ressemble. Tout reste sur votre appareil.',
    pair: 'Quelle langue apprenez-vous ?', name: 'Votre prénom', gender: 'Vous êtes…', genderHint: 'pour les particules de politesse',
    man: 'Un homme', woman: 'Une femme', levelsTitle: 'Votre niveau, compétence par compétence',
    levelsIntro: 'Le thaï se parle et s’écrit très différemment : on peut très bien parler sans lire une seule lettre. Soyez précis, le parcours s’adapte.',
    placement: 'Tester ma lecture (2 min)', placementTitle: 'Test de lecture', placementIntro: 'Quelques lettres et mots à reconnaître. Répondez « je ne sais pas » sans hésiter.',
    dontKnow: 'Je ne sais pas', done: 'Construire mon parcours', dailyGoal: 'Objectif quotidien',
  },
  home: {
    today: 'Aujourd’hui', nextLesson: 'Prochaine leçon', resume: 'Reprendre la leçon', lesson: 'Leçon', review: 'Révision', cards: 'cartes',
    progress: 'Progression', streak: 'Série', days: 'jours', day: 'jour', recentlyLearned: 'Appris récemment', path: 'Mon parcours', unit: 'Unité',
    allDone: 'Toutes les leçons disponibles sont terminées. Continuez avec les révisions et les entraînements.', locked: 'À débloquer',
    knownOrally: 'Vous connaissez déjà ces mots à l’oral : ici, on apprend à les lire.', xp: 'XP', level: 'Niveau',
  },
  lesson: {
    step: 'Étape', of: 'sur', theory: 'À retenir', discover: 'Découvrir', practice: 'S’entraîner', test: 'Défi', review: 'Révision',
    finished: 'Leçon terminée', score: 'Score', xpEarned: 'XP gagnés', newItems: 'Nouveautés', toReview: 'À retravailler', passed: 'Leçon validée',
    failed: 'Pas encore acquis', nextLesson: 'Leçon suivante', backHome: 'Retour à l’accueil', quitConfirm: 'Quitter la leçon ?',
    tapToReveal: 'Touchez pour voir la réponse', howWell: 'Comment ça s’est passé ?', rate: ['Encore', 'Difficile', 'Bien', 'Facile'],
    whichLetter: 'Quelle lettre entendez-vous ?', whichSound: 'Quel est le son de cette lettre ?', whichVowel: 'Quelle est cette voyelle ?',
    whichWord: 'Quel mot entendez-vous ?', meaningOf: 'Que veut dire…', howToSay: 'Comment dit-on…', readThis: 'Comment se lit…',
    whichTone: 'Quel est le ton de ce mot ?', whichToneHeard: 'Quel ton entendez-vous ?', liveOrDead: 'Cette syllabe est-elle vivante ou morte ?',
    live: 'Vivante', dead: 'Morte', matchPairs: 'Associez les paires', spell: 'Écrivez le mot avec les signes', order: 'Remettez les mots dans l’ordre',
    whichHeard: 'Lequel entendez-vous ?', readSyllable: 'Comment se lit cette syllabe ?', repeat: 'À vous : répétez', repeatHint: 'Écoutez, puis enregistrez-vous et comparez.',
    whyTone: 'Pourquoi ce ton', understood: 'J’ai compris', readAll: 'J’ai lu ce texte', dialogDone: 'J’ai compris ce dialogue',
  },
  review: {
    title: 'Réviser', due: 'à réviser', nothingDue: 'Rien à réviser pour l’instant', startReview: 'Lancer la révision', train: 'S’entraîner',
    modes: {
      flashcards: 'Cartes', listening: 'Écoute', speed: 'Lecture rapide', match: 'Associer', dictation: 'Dictée', tones: 'Tons', quiz: 'Quiz', timed: 'Défi chrono', pronunciation: 'Prononciation',
    },
    modesDesc: {
      flashcards: 'Revoir et noter ce que vous savez', listening: 'Lettres, mots et phrases à l’oreille', speed: 'Lire vite, sans phonétique', match: 'Relier thaï et sens',
      dictation: 'Entendre, retrouver l’écrit', tones: 'Lire et entendre les tons', quiz: 'Un peu de tout', timed: '25 questions, le plus vite possible', pronunciation: 'Dire le mot, vérifier que le thaï est compris',
    },
    weak: 'Points faibles', onlyLearned: 'Les entraînements n’utilisent que ce que vous avez déjà appris.',
  },
  explore: {
    title: 'Explorer', alphabet: 'Alphabet', vowels: 'Voyelles', tones: 'Tons', numbers: 'Nombres', vocabulary: 'Vocabulaire', conversations: 'Conversations',
    readings: 'Lectures', grammar: 'Grammaire', classifiers: 'Classificateurs', phrasebook: 'Phrases de voyage', writing: 'Écriture', transcription: 'Transcription',
    search: 'Recherche',
  },
  profile: {
    title: 'Profil', levels: 'Mes niveaux', settings: 'Réglages', data: 'Mes données', share: 'Partager ma progression', badges: 'Badges', stats: 'Statistiques',
    export: 'Exporter mes données', import: 'Importer mes données', reset: 'Réinitialiser', voice: 'Voix', transliteration: 'Translittération',
    translit: { always: 'Toujours', learning: 'Apprentissage', hidden: 'Masquée' },
    theme: 'Apparence', thaiSize: 'Taille du thaï', autoAudio: 'Audio automatique', slowSpeed: 'Vitesse lente',
  },
} as const;

export type Dict = typeof fr;
