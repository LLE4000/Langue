# Idées de jeux en ligne à plusieurs

*Mis de côté le 29 septembre 2026, à reprendre au moment voulu. Rien n'est encore développé.*

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

## Pour décider le moment venu

| Jeu | Ce qu'il entraîne | Travail restant (estimation) | Dépend de |
|---|---|---|---|
| Loto thaï | oreille, lien son ↔ écriture | faible | serveur en service |
| « Tu m'as compris ? » | prononciation et tons, jugés par des humains | moyen (audio relayé, vie privée) | serveur en service |
| Course de lecture | fluidité et justesse de lecture | faible | serveur en service, micro de chacun |

Ordre suggéré : **Loto** d'abord (le plus simple, pour tous les niveaux), puis la **Course de lecture**, puis **« Tu m'as compris ? »**, le plus riche mais le plus délicat.
