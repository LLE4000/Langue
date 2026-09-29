# Idées de jeux en ligne à plusieurs

*Mis de côté le 29 septembre 2026, à reprendre au moment voulu. Rien n'est encore développé.*

Les jeux 1 à 3 sont des jeux courts à plusieurs ; le 4 est un jeu d'aventure, plus ambitieux.

Ces trois jeux se jouent chacun sur son téléphone, dans une salle en ligne. Ils utilisent tous le serveur déjà écrit
dans `server/` : une salle avec un code de 5 lettres, 2 à 6 joueurs, des manches cadencées par le serveur,
la reconnexion et la revanche. Ce serveur n'est pas encore en service ; voir `server/README.md`.
Pour chaque jeu, la dernière section liste ce qu'il faut encore vérifier avant de le construire.

---

## 1. Loto thaï (bingo)

**Le principe.** Chaque joueur reçoit un carton de 4 × 4 cases (syllabes, mots ou nombres) tiré au sort.
La voix native annonce un élément toutes les quelques secondes. On touche la case si on l'a.
Le premier qui complète une ligne gagne, puis on continue pour le carton plein.

**Déroulé.**
1. L'hôte choisit le contenu :
   - syllabes d'une classe de consonnes, avec le moteur de la grille de lecture ;
   - mots appris ;
   - un thème ;
   - les nombres.
2. Le serveur tire les cartons, un par joueur, tous différents, et l'ordre des annonces.
3. Chaque annonce est jouée en même temps chez tous. Une case touchée à tort est comptée comme faute, mais n'élimine pas.
4. « Ligne ! » est vérifiée par le serveur. Les autres voient qui a gagné et les cases qu'il avait.

**Ce que ça entraîne.** Reconnaître vite à l'oreille ce qu'on voit écrit : le lien son ↔ écriture, les tons, les nombres.

**Pourquoi c'est amusant.** Tout le monde connaît le loto : aucune règle à expliquer. Ça marche à 2 comme avec une classe entière.
Un débutant peut gagner contre un avancé, car la chance compte.

**Faisabilité.**
- Cartons : moteur de la grille de lecture (`engine/readaloud/grid.ts`) pour les syllabes, listes existantes pour les mots et les nombres.
- Voix : clips natifs déjà générés.
- Serveur : il manque une phase « annonce » au lieu de « question à choix », peu de changement dans `server/src/game.ts`.

**À vérifier.**
- Nombre de joueurs maximum : 6 aujourd'hui. Faut-il plus pour une classe ?
- Délai entre deux annonces, à régler selon le niveau.

---

## 2. « Tu m'as compris ? » (téléphone thaï)

**Le principe.** À tour de rôle, un joueur reçoit un mot ou une phrase courte et le dit au micro.
Son audio est envoyé aux autres, qui choisissent ce qu'ils ont compris parmi quatre propositions.
Si les autres ont compris, **le locuteur et les auditeurs** marquent des points.

**Déroulé.**
1. Le serveur choisit l'élément. Les leurres sont des mots proches, en particulier même syllabe avec un autre ton (ป่า / ป้า), ou longueur de voyelle différente.
2. Le locuteur voit le mot, s'enregistre (quelques secondes), puis l'audio part vers les autres.
3. Les auditeurs écoutent (2 fois au plus) et répondent.
4. Révélation :
   - ce qui était demandé, ce que chacun a compris ;
   - le modèle natif à réécouter à côté de l'enregistrement du joueur.

**Ce que ça entraîne.** La prononciation, et surtout **les tons**, jugés par des humains.
C'est justement ce qu'aucun service automatique ne sait noter en thaï (voir `docs/recherche-voix-thai.md`).
Cela entraîne aussi l'écoute d'autres voix que la voix de synthèse.

**Pourquoi c'est amusant.** Les malentendus font rire. On a envie d'être compris de ses amis, pas d'une machine,
et on peut jouer avec un ami thaïlandais, qui devient l'arbitre naturel.

**Faisabilité.**
- Le serveur doit relayer de courts fichiers audio : quelques dizaines de Ko par tour, envoyés par la WebSocket ou stockés temporairement.
- Enregistrement : déjà en place (`MicPanel`).
- Leurres : le moteur de voisins de la lecture à voix haute (`variantsOf`) sait déjà fabriquer « même syllabe, autre ton ».

**À vérifier.**
- Vie privée : l'audio ne doit pas être conservé après la partie, et il faut le dire aux joueurs.
- Qualité du micro sur les téléphones bas de gamme.

---

## 3. Course de lecture

**Le principe.** Tous les joueurs reçoivent **la même grille de lecture** (consonnes × voyelles) et la lisent à voix haute en même temps.
Chacun voit sa progression et celle des autres, en direct, sous forme de barres.
Le gagnant est le plus rapide **parmi ceux qui lisent juste** : une case fausse coûte du temps.

**Déroulé.**
1. L'hôte règle la grille comme dans l'exercice : classe, voyelles, marques, taille.
2. Compte à rebours, puis tout le monde lit : le micro juge chaque case, comme dans la grille actuelle.
3. Les progressions sont envoyées au serveur au fil de la lecture : case atteinte, justes, erreurs.
4. Arrivée : classement, temps, justesse, et la grille colorée de chacun.

**Ce que ça entraîne.** La fluidité de lecture, c'est-à-dire lire sans déchiffrer, et la justesse sous pression.
C'est exactement l'exercice du tableau avec un professeur, en version compétition.

**Pourquoi c'est amusant.** La course est visible, courte (une à deux minutes) et on a envie de rejouer tout de suite.
La revanche est immédiate avec une nouvelle grille.

**Faisabilité.**
- Grille et jugement : déjà faits (`ReadGrid.tsx`, moteur du tapis de lecture).
- Serveur : il manque seulement des messages de progression.

**À vérifier.**
- La reconnaissance vocale reste imparfaite sur des syllabes isolées : le jugement doit rester indulgent pour ne pas fausser la course. Une piste est de compter surtout le temps et de pénaliser seulement les erreurs nettes.
- Il faut que le micro fonctionne chez tous les joueurs. Sinon, prévoir un repli « je touche quand j'ai lu ».

---

## 4. Missions en Thaïlande (jeu d'aventure, idée du 29 septembre 2026)

*Idée de départ, à creuser : « un jeu style jeu vidéo, avec un petit personnage, des conversations, des choix ; il faut comprendre ce qu'on nous dit ; si on se trompe, on perd la mission ; uniquement en Thaïlande ; à plusieurs, on se lance des missions ; quelque chose d'addictif ».*

**Le principe.** On incarne un petit personnage qui voyage en Thaïlande. Chaque mission est une scène de la vie réelle :
- acheter un billet de train pour Chiang Mai ;
- retrouver son hôtel en demandant son chemin ;
- négocier au marché flottant ;
- commander sans piment ;
- aller à la pharmacie ;
- rendre visite à un chantier.

Les personnages parlent **en thaï, avec la voix native**. À chaque réplique, on choisit sa réponse parmi plusieurs, ou on la **dit au micro** (moteur de la conversation parlée). Il faut **comprendre** ce qu'on nous dit pour choisir la bonne action : le vendeur annonce un prix, le chauffeur propose un détour, l'employé donne un quai et une heure.

**Si on se trompe.**
- On perd une vie (par exemple 3 par mission).
- Plus de vies : **mission ratée**, on la recommence.
- Les erreurs ont des conséquences dans l'histoire : un mauvais quai, et on rate le train ; un mauvais chiffre, et on paie trop cher.

**La carte.** Une carte de la Thaïlande qui se débloque, du plus simple au plus difficile :
Bangkok (A0–A1) → Ayutthaya → Chiang Mai → Isan → les îles du Sud (A2–B1).
Chaque mission rapporte 1 à 3 étoiles, et des **souvenirs à collectionner** : photos, objets, recettes, avec leur mot thaï.

**À plusieurs.**
- **Se lancer des missions** : « Fais mieux que moi au marché de Chatuchak » ; on rejoue la même mission et on compare étoiles, temps et erreurs. Même principe que le défi à distance actuel, sans serveur.
- **Mission de la semaine** : la même pour tout le monde, avec un classement entre amis.
- **Missions à deux (coopération)**, la plus originale : chacun n'a que la moitié de l'information. Par exemple, l'un voit le plan du métro et l'autre parle au guichetier. Il faut se transmettre les infos… en thaï. Ce mode demande le serveur des salles en ligne.

**Pourquoi ce serait addictif.**
- Une histoire qui avance.
- Une carte à compléter, des étoiles et des souvenirs à collectionner.
- Le risque de perdre la mission.
- Des missions courtes (3 à 5 minutes).
- La comparaison avec les amis.
- Et l'utilité réelle : ce sont les situations qu'on vivra vraiment en Thaïlande.

**Ce qui existe déjà et servirait.**
- 50 conversations écrites et relues.
- Les voix natives.
- Le moteur qui juge une réponse dite au micro, avec 801 formulations acceptées.
- La compréhension orale et ses questions.
- Les nombres et les prix.
- Le défi à distance par lien.

**Points durs, à trancher avant de se lancer (regard critique).**
- **Le contenu coûte cher.** Une mission avec des choix, c'est un dialogue *ramifié* : plusieurs suites possibles, toutes à écrire, faire relire en thaï et faire générer en voix. Compter plusieurs fois le travail d'un dialogue actuel. Commencer par 8–10 missions à Bangkok pour tester l'intérêt avant d'en écrire d'autres.
- **Les images.** Personnages, décors et carte demandent une direction artistique cohérente. C'est un budget d'illustration, ou un style très simple (silhouettes, icônes) au début.
- **« Perdre la mission » peut décourager un débutant.** Il faut des points de reprise, une aide limitée (réécouter au ralenti, afficher la phonétique contre une étoile), et un niveau de difficulté qui suit le niveau de l'apprenant.
- **Ne pas en faire un jeu de hasard.** Les mauvais choix doivent être plausibles et instructifs (un ton qui change le sens, un nombre mal compris), pas des pièges gratuits.
- **La coopération à deux** dépend du serveur (voir `server/`). Le reste (missions solo, défis par lien, mission de la semaine) peut fonctionner sans.

**Première étape suggérée, le moment venu.** Un prototype de 3 missions à Bangkok (le taxi, le marché, le restaurant) avec la carte, les vies et les étoiles, à partir des dialogues existants, pour vérifier que c'est amusant avant d'investir dans le contenu.

---

## Pour décider le moment venu

| Jeu | Ce qu'il entraîne | Travail restant (estimation) | Dépend de |
|---|---|---|---|
| Loto thaï | oreille, lien son ↔ écriture | faible | serveur en service |
| « Tu m'as compris ? » | prononciation et tons, jugés par des humains | moyen (audio relayé, vie privée) | serveur en service |
| Course de lecture | fluidité et justesse de lecture | faible | serveur en service, micro de chacun |
| Missions en Thaïlande | compréhension orale, réponses en situation, nombres | élevé (dialogues ramifiés, illustrations) | rien pour le solo et les défis par lien ; serveur pour la coopération |

Ordre suggéré : **Loto** d'abord (le plus simple, pour tous les niveaux), puis la **Course de lecture**, puis **« Tu m'as compris ? »**, le plus riche mais le plus délicat.
