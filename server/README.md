# Serveur de Langue — EN PAUSE

Chantier 10, mis en pause : rien ici n'est déployé ni branché dans l'application.

Contenu : un Worker Cloudflare avec
- des salles en ligne (Durable Objects, WebSocket, code de 5 lettres, 2 à 6 joueurs, manches cadencées par le serveur) ;
- un service de jetons Azure Speech (`/azure-token`, la clé reste sur le serveur, plafond quotidien, limites par IP).

Vérifié en local : `npx vitest run server` (règles du jeu) et une partie complète à deux navigateurs
(`scripts/shots-online.mjs` contre `npx wrangler dev`, avec `ALLOWED_ORIGINS="*"` dans `server/.dev.vars`).

Pour reprendre : compte Cloudflare gratuit, secrets `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` dans GitHub, workflow de
déploiement à écrire, puis `VITE_SERVER_URL` au build de l'application et les routes indiquées en tête de
`src/features/play/Online.tsx`.
