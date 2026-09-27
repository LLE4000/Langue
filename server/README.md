# Serveur de Langue (Cloudflare Worker)

Deux services, rien d'autre (aucun compte, aucune donnée d'apprentissage) :
- **salles en ligne** : code de 5 lettres, 2 à 6 joueurs chacun sur son téléphone, manches cadencées par le serveur
  (Durable Objects, WebSocket) ;
- **jetons Azure Speech** (`/azure-token`) : la clé reste sur le serveur, l'application reçoit des jetons de 10 minutes ;
  plafond de 300 jetons par jour (`AZURE_TOKENS_PER_DAY`, garde-fou de facturation) et limites par adresse IP.

## Mise en service (une fois, ≈ 10 minutes)

1. Créer un compte gratuit sur <https://dash.cloudflare.com/sign-up>, puis ouvrir **Workers & Pages** une première fois
   (Cloudflare demande de choisir un sous-domaine `xxx.workers.dev` : n'importe lequel).
2. **Account ID** : dans Workers & Pages, colonne de droite, « Account ID » → copier.
3. **Jeton d'API** : Mon profil › API Tokens › Create Token › modèle **« Edit Cloudflare Workers »** › Continue › Create →
   copier le jeton (affiché une seule fois).
4. Dans GitHub : dépôt › Settings › Secrets and variables › Actions › New repository secret, deux secrets :
   `CLOUDFLARE_API_TOKEN` (le jeton) et `CLOUDFLARE_ACCOUNT_ID` (l'identifiant).
5. Relancer le déploiement : Actions › « Déployer sur GitHub Pages » › Run workflow.

Le workflow déploie alors le serveur, puis construit l'application avec son adresse : l'onglet Défis affiche
« En ligne, en direct », et l'évaluation Azure de la lecture à voix haute devient incluse (plus besoin de clé personnelle).
Sans ces secrets, ou si le déploiement du serveur échoue, le site est publié comme avant, sans le jeu en ligne.

## Développement

`npm ci && npx wrangler dev` (dans `server/`), avec `ALLOWED_ORIGINS="*"` dans `server/.dev.vars`.
Tests : `npx vitest run server` (règles du jeu, depuis la racine) ; partie complète à deux navigateurs :
`scripts/shots-online.mjs` contre une application construite avec `VITE_SERVER_URL=http://127.0.0.1:8787`.
