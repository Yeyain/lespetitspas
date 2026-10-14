<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Les Petits Pas – Règles pour l'agent IA

## Le projet
Application web pour une crèche de 30 enfants (sections : Bébés, Moyens, Grands).
- Staff : saisie des événements (repas, siestes, activités, médicaments, incidents), timeline, traitement des messages parents.
- Parents : consultation de la timeline de leurs enfants uniquement, messages à l'équipe (500 caractères max).

## Règles métier critiques
- Interdit de saisir un médicament sans autorisation parentale confirmée.
- Chaque événement affiche « Saisi par [Prénom] » côté parent.
- Un parent ne voit jamais les données d'un autre enfant (sécurité RLS Supabase).

## Stack
Next.js (App Router, TypeScript), Tailwind CSS, ShadCN UI, Supabase (PostgreSQL, RLS, Auth), Vercel, Resend, Playwright.

## Organisation du code
- Pas de dossier `src/` : le code est dans `app/` à la racine.
- Branches : `staging` (tests) et `main` (production). Ne jamais pousser directement sur `main`.

## Design
Couleurs : primary #9FA8DA, secondary #80CBC4, accent #F48FB1, fond #F0F4F8, surface #FFFFFF, texte #1A237E, texte secondaire #78909C, erreur #EF9A9A.
Polices : titres « Plus Jakarta Sans », texte « DM Sans ».

## Ne jamais toucher
- Les fichiers `.env*` et `JOURNAL.md` : ne pas les lire à voix haute, ne pas les modifier, ne jamais les committer.
- Ne jamais écrire de clé secrète dans le code.

## Façon de travailler
- Tu peux modifier le code seul, sans demander avant.
- Après chaque modification, explique-moi en français simple ce que tu as fait et pourquoi.
- Évite le jargon technique ; si tu l'utilises, explique-le en une phrase.
- Réponses courtes.

## Product Backlog
- Le backlog est dans `BACKLOG.md`.
- Après chaque fonctionnalité terminée, mets à jour `BACKLOG.md` : coche ce qui est fait, ajoute les nouvelles idées.
- Format : une liste de user stories avec un statut (À faire / En cours / Fait).