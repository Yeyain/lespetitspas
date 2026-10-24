# Product Backlog – Les Petits Pas

> Fichier tenu à jour par l'agent IA (voir `AGENTS.md`). Statuts possibles : **À faire**, **En cours**, **Terminé**.
> Rôles : **Staff** (équipe de la crèche), **Parent**.

## Vue d'ensemble des phases

| Phase | Objectif | Stories |
|---|---|---|
| 1 | Cadrage & design | US-01 à US-02 |
| 2 | Environnement technique | US-03 à US-06 |
| 3 | Déploiement & CI/CD | US-07 à US-09 |
| 4 | Base de données & sécurité (SQL, RLS) | US-10 à US-18 |
| 5 | Authentification & comptes | US-19 à US-22 |
| 6 | Espace Staff | US-23 à US-30 |
| 7 | Espace Parents | US-31 à US-33 |
| 8 | Messagerie parents → équipe | US-34 à US-36 |
| 9 | Emails transactionnels (Resend) | US-37 à US-38 |
| 10 | Tests automatisés (Playwright) | US-39 à US-41 |
| 11 | Mise en production | US-42 à US-43 |

---

# Phase 1 – Cadrage & design

### US-01 – Prototype Figma validé
- **User Story** : En tant que porteur du projet, je veux un prototype Figma Make des écrans, afin de valider l'expérience avant de coder.
- **Entité** : Design
- **Critères d'acceptation** :
  - Le prototype couvre les écrans Staff et Parents.
  - Le lien public est accessible.
- **Statut** : Terminé
- **Contraintes / Dépendances** : Aucune.
- **Description technique** : Prototype Figma Make : https://www.figma.com/make/ZgbSW6q6HtIHWEiIAEFQAK/lespetitspas?t=5Q3GoNIVKtz4Yfgr-1

### US-02 – Charte graphique définie
- **User Story** : En tant que porteur du projet, je veux une charte graphique claire, afin d'avoir une interface cohérente et apaisante.
- **Entité** : Design system
- **Critères d'acceptation** :
  - Couleurs définies : primary #9FA8DA, secondary #80CBC4, accent #F48FB1, fond #F0F4F8, surface #FFFFFF, texte #1A237E, texte secondaire #78909C, erreur #EF9A9A.
  - Polices définies : titres Plus Jakarta Sans, corps DM Sans.
- **Statut** : Terminé
- **Contraintes / Dépendances** : US-01.
- **Description technique** : Documentée dans `AGENTS.md`. Sera appliquée dans le code via US-06.

---

# Phase 2 – Environnement technique

### US-03 – Projet Next.js initialisé
- **User Story** : En tant que développeur, je veux un projet Next.js prêt à l'emploi, afin de commencer à construire l'application.
- **Entité** : Application
- **Critères d'acceptation** :
  - Next.js (App Router, TypeScript), Tailwind CSS et ShadCN UI (Nova, Radix) installés.
  - La page `app/page.tsx` s'affiche en local.
- **Statut** : Terminé
- **Contraintes / Dépendances** : Aucune.
- **Description technique** : Pas de dossier `src/` : code dans `app/`, `components/`, `lib/` à la racine. Gestionnaire de paquets : pnpm.

### US-04 – Deux projets Supabase isolés
- **User Story** : En tant que développeur, je veux un projet Supabase de test et un de production, afin de ne jamais mélanger les données.
- **Entité** : Infrastructure
- **Critères d'acceptation** :
  - Projet test `lespetitspas` et projet production `lespetitspas-prod` créés.
  - Aucune donnée réelle n'est jamais écrite sur le projet de test.
- **Statut** : Terminé
- **Contraintes / Dépendances** : Aucune.
- **Description technique** : Test/Preview et Production séparés, chacun avec sa propre URL et sa propre clé anonyme.

### US-05 – Variables d'environnement et secrets protégés
- **User Story** : En tant que développeur, je veux que les clés soient configurées proprement, afin qu'aucun secret ne fuite sur GitHub.
- **Entité** : Configuration
- **Critères d'acceptation** :
  - `.env.local` contient les clés de test.
  - `.env*` et `JOURNAL.md` sont dans `.gitignore`.
  - Vercel a des valeurs séparées Production / Preview.
- **Statut** : Terminé
- **Contraintes / Dépendances** : US-04.
- **Description technique** : Variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Aucune clé « service role » ne doit commencer par `NEXT_PUBLIC_`.

### US-06 – Charte graphique intégrée au code
- **User Story** : En tant qu'utilisateur, je veux une interface aux couleurs et polices de la charte, afin d'avoir une expérience cohérente.
- **Entité** : Design system
- **Critères d'acceptation** :
  - Couleurs configurées comme variables de thème (Tailwind / ShadCN).
  - Polices Plus Jakarta Sans et DM Sans chargées.
  - La page d'accueil reflète la charte.
- **Statut** : Terminé
- **Contraintes / Dépendances** : US-02, US-03.
- **Description technique** : `app/globals.css` (variables CSS du thème, arrondis 1rem, ombres légères teintées marine), `app/layout.tsx` (chargement via `next/font/google`), composants ShadCN `Button` et `Card` ajustés (plus grands, plus arrondis). Pas de `tailwind.config` : Tailwind v4 se configure dans `globals.css`. Idée : prévoir un thème sombre aux couleurs de la charte (l'actuel est gris par défaut).

### US-44 – Connexion Supabase préparée
- **User Story** : En tant que développeur, je veux des clients Supabase prêts à l'emploi et typés, afin de lire et écrire les données sans erreur de nom de colonne.
- **Entité** : Toutes les tables
- **Critères d'acceptation** :
  - `@supabase/supabase-js` et `@supabase/ssr` installés.
  - Un client navigateur et un client serveur (session via cookies).
  - Types TypeScript des 6 tables : `profiles`, `children`, `parent_children`, `events`, `medication_authorizations`, `messages`.
- **Statut** : Terminé
- **Contraintes / Dépendances** : US-04, US-05.
- **Description technique** : `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/database.types.ts`. Clés lues depuis `.env.local`, jamais en dur. Idée : remplacer plus tard les types écrits à la main par ceux générés avec `supabase gen types`.

---

# Phase 3 – Déploiement & CI/CD

### US-07 – Déploiement staging fonctionnel
- **User Story** : En tant que développeur, je veux voir l'application en ligne sur staging, afin de valider chaque changement avant la production.
- **Entité** : Déploiement
- **Critères d'acceptation** :
  - L'URL de preview Vercel de la branche `staging` affiche la page de test (plus d'erreur 404).
  - Les variables Preview pointent vers le Supabase de test.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-03, US-05.
- **Description technique** : Build réussi mais 404 sur la preview. Piste : vérifier dans Vercel > Settings > Build & Development Settings que « Override » est désactivé (Build Command, Output Directory), puis Redeploy sans cache.

### US-08 – Passage en production via Pull Request
- **User Story** : En tant que développeur, je veux fusionner `staging` dans `main`, afin de publier une version validée.
- **Entité** : Déploiement
- **Critères d'acceptation** :
  - Une PR `staging` → `main` est créée et fusionnée sur GitHub.
  - Le déploiement de production est « Ready » et affiche la page de test.
  - L'URL de production est notée dans `JOURNAL.md`.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-07.
- **Description technique** : GitHub flow : jamais de push direct sur `main`.

### US-09 – Fichiers de pilotage pour l'agent IA
- **User Story** : En tant que développeur, je veux des fichiers de consignes et de suivi, afin que l'IA travaille de façon cohérente.
- **Entité** : Documentation
- **Critères d'acceptation** :
  - `AGENTS.md` et `CLAUDE.md` (contenant `@AGENTS.md`) sont à la racine.
  - `BACKLOG.md` est à la racine et versionné dans Git.
  - `JOURNAL.md` reste ignoré par Git.
- **Statut** : En cours
- **Contraintes / Dépendances** : Aucune.
- **Description technique** : Doublons dans `app/` à supprimer. Commit sur `staging`.

---

# Phase 4 – Base de données & sécurité

### US-10 – Tables sections et enfants
- **User Story** : En tant que staff, je veux que les 30 enfants soient rattachés à leur section, afin de les retrouver facilement.
- **Entité** : `sections`, `children`
- **Critères d'acceptation** :
  - 3 sections : Bébés, Moyens, Grands.
  - Un enfant a un prénom, un nom, une date de naissance et une section.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-04.
- **Description technique** : Scripts SQL versionnés dans un dossier `supabase/migrations/`. Clés primaires en UUID.

### US-11 – Table profils et rôles
- **User Story** : En tant que système, je veux distinguer staff et parents, afin d'afficher les bons écrans et droits.
- **Entité** : `profiles`
- **Critères d'acceptation** :
  - Chaque utilisateur Supabase Auth a un profil avec prénom et rôle (`staff` ou `parent`).
  - Un profil est créé automatiquement à l'inscription.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-04.
- **Description technique** : Table liée à `auth.users`, trigger de création de profil. Le prénom alimente la mention « Saisi par ».

### US-12 – Lien parents ↔ enfants
- **User Story** : En tant que parent, je veux être rattaché à mes enfants, afin de ne voir que leurs informations.
- **Entité** : `parent_children`
- **Critères d'acceptation** :
  - Un parent peut avoir plusieurs enfants, un enfant plusieurs parents.
  - Contrainte d'unicité sur le couple (parent, enfant).
- **Statut** : À faire
- **Contraintes / Dépendances** : US-10, US-11.
- **Description technique** : Table de jointure avec clés étrangères. Base des règles de sécurité de US-16.

### US-13 – Table des événements de la journée
- **User Story** : En tant que staff, je veux enregistrer des événements typés, afin de constituer la timeline de chaque enfant.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Types : repas, sieste, activité, médicament, incident.
  - Chaque événement a un enfant, un type, une date/heure, un détail et l'auteur (staff).
- **Statut** : À faire
- **Contraintes / Dépendances** : US-10, US-11.
- **Description technique** : Colonne `type` en enum, colonne `details` en JSON pour les champs propres à chaque type, index sur (enfant, date).

### US-14 – Table des autorisations parentales de médicaments
- **User Story** : En tant que crèche, je veux enregistrer les autorisations parentales, afin de n'administrer que les médicaments autorisés.
- **Entité** : `medication_authorizations`
- **Critères d'acceptation** :
  - Une autorisation est liée à un enfant, un médicament, avec statut « confirmée » et période de validité.
  - Sans autorisation confirmée et valide, aucun événement « médicament » ne peut être créé.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-13.
- **Description technique** : Règle critique appliquée **dans la base** (trigger ou politique RLS), pas seulement dans l'interface. Idée : un trigger qui refuse tout événement `medicament` dont `authorization_id` ne couvre pas l'enfant et la date, en dernier rempart derrière la Server Action de US-28.

### US-15 – Table des messages
- **User Story** : En tant que parent, je veux que mes messages soient stockés, afin que l'équipe puisse les traiter.
- **Entité** : `messages`
- **Critères d'acceptation** :
  - Un message a un parent, un enfant concerné, un texte de 500 caractères maximum et un statut (nouveau, lu, traité).
- **Statut** : À faire
- **Contraintes / Dépendances** : US-11, US-12.
- **Description technique** : Contrainte `CHECK (char_length(contenu) <= 500)`.

### US-16 – Sécurité RLS côté parents
- **User Story** : En tant que parent, je veux que seules les données de mes enfants me soient accessibles, afin de garantir la confidentialité.
- **Entité** : Toutes les tables (RLS)
- **Critères d'acceptation** :
  - Un parent ne peut lire que les événements et enfants qui lui sont liés.
  - Un parent ne peut ni modifier ni supprimer un événement.
  - Un parent ne lit que ses propres messages.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-12, US-13, US-15.
- **Description technique** : Row Level Security activée sur toutes les tables, politiques basées sur `auth.uid()` et `parent_children`.

### US-17 – Sécurité RLS côté staff
- **User Story** : En tant que staff, je veux accéder à tous les enfants et événements, afin de faire mon travail.
- **Entité** : Toutes les tables (RLS)
- **Critères d'acceptation** :
  - Le staff lit tous les enfants, événements et messages.
  - Le staff crée des événements en son nom uniquement.
  - Le staff ne peut pas lire les profils inutiles à son travail au-delà du nécessaire.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-11, US-16.
- **Description technique** : Politiques basées sur le rôle dans `profiles`, via une fonction SQL `is_staff()`.

### US-18 – Données de test
- **User Story** : En tant que développeur, je veux des données fictives réalistes, afin de tester sans données réelles.
- **Entité** : Toutes les tables
- **Critères d'acceptation** :
  - 30 enfants fictifs répartis dans les 3 sections.
  - Quelques comptes staff et parents fictifs, liés aux enfants.
  - Chargées uniquement sur le projet de test.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-10 à US-12.
- **Description technique** : Script `supabase/seed.sql`. Jamais exécuté sur la production.

---

# Phase 5 – Authentification & comptes

### US-19 – Connexion
- **User Story** : En tant qu'utilisateur, je veux me connecter avec mon email et mon mot de passe, afin d'accéder à mon espace.
- **Entité** : `auth.users`, `profiles`
- **Critères d'acceptation** :
  - Un message d'erreur clair s'affiche en cas d'identifiants incorrects.
  - Une fois connecté, la session persiste.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-11.
- **Description technique** : Supabase Auth avec `@supabase/ssr`, page `app/login` (formulaire ShadCN + action serveur `app/login/actions.ts`). Session rafraîchie à chaque requête par `proxy.ts` (nouveau nom du « middleware » dans Next.js 16). Message d'erreur testé. Reste à tester avec un vrai compte staff et un vrai compte parent (US-18).

### US-20 – Redirection selon le rôle
- **User Story** : En tant qu'utilisateur, je veux arriver directement sur mon espace, afin de ne pas me perdre.
- **Entité** : `profiles`
- **Critères d'acceptation** :
  - Staff redirigé vers l'espace staff, parent vers l'espace parent.
  - Un parent ne peut pas accéder aux pages staff, même en tapant l'adresse.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-19.
- **Description technique** : Après connexion, lecture de `profiles.role` et redirection vers `/staff` ou `/parent`. Chaque page vérifie le rôle avec `requireRole()` (`lib/auth.ts`) : un parent qui tape `/staff` est renvoyé vers `/parent`. Reste à tester avec un vrai compte staff et un vrai compte parent (US-18).

### US-21 – Invitation d'un parent par le staff
- **User Story** : En tant que staff, je veux inviter un parent par email, afin qu'il crée son compte.
- **Entité** : `profiles`, `parent_children`
- **Critères d'acceptation** :
  - Le staff saisit email et enfant(s) concerné(s).
  - Le parent reçoit un lien pour définir son mot de passe.
  - Le parent est automatiquement rattaché à ses enfants.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-12, US-19, US-37.
- **Description technique** : Invitation Supabase côté serveur uniquement (clé « service role » jamais exposée au navigateur).

### US-22 – Déconnexion et pages protégées
- **User Story** : En tant qu'utilisateur, je veux pouvoir me déconnecter, afin de protéger mes données sur un appareil partagé.
- **Entité** : `auth.users`
- **Critères d'acceptation** :
  - Un bouton de déconnexion est visible partout.
  - Sans session, toute page protégée renvoie vers la connexion.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-19.
- **Description technique** : `proxy.ts` renvoie vers `/login` sans session (testé sur `/staff` et `/parent`). Bouton « Se déconnecter » dans le layout global (`components/logout-button.tsx`), action `logout`. Reste à tester avec un vrai compte staff et un vrai compte parent (US-18).

---

# Phase 6 – Espace Staff

### US-23 – Liste des enfants par section
- **User Story** : En tant que staff, je veux voir les enfants par section, afin de choisir rapidement celui concerné.
- **Entité** : `children`, `sections`
- **Critères d'acceptation** :
  - Trois onglets ou filtres : Bébés, Moyens, Grands.
  - Un clic sur un enfant ouvre sa fiche.
  - Affichage rapide, utilisable sur tablette.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-10, US-17, US-20.
- **Description technique** : Page `/staff` : grille de cartes ShadCN (photo ou initiales, prénom, nom, section), recherche par nom sans majuscules ni accents, filtre Tous / Bébés / Moyens / Grands (Tabs). Lecture via Supabase côté serveur, filtrage instantané dans le navigateur. Fiche provisoire `/staff/children/[id]` (prénom + nom). Nouvelle colonne `children.photo_url` ajoutée aux types. Reste à tester avec un compte staff et les 30 enfants de test (US-18). Idée : permettre d'ajouter la photo d'un enfant (stockage Supabase).

### US-24 – Saisie d'un repas
- **User Story** : En tant que staff, je veux saisir un repas en quelques secondes, afin de ne pas perdre de temps auprès des enfants.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Choix de ce qui a été mangé et de la quantité (ex. tout, la moitié, peu).
  - L'événement apparaît aussitôt dans la timeline.
  - Auteur enregistré automatiquement.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-13, US-23.
- **Description technique** : Formulaire court avec boutons de choix, validation côté serveur. **Avancement** : parties 1 à 3 faites : formulaire, enregistrement par la Server Action `createEvent` (`app/staff/children/[id]/events/new/actions.ts` : rôle staff vérifié, auteur lu côté serveur, champs revalidés, heure de Paris), retour à la fiche où l'événement apparaît avec ses détails. Reste à tester avec un compte staff et des données (US-18) avant de passer en « Terminé ».

### US-25 – Saisie d'une sieste
- **User Story** : En tant que staff, je veux noter une sieste, afin d'informer les parents du repos de leur enfant.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Heure de début et de fin (ou durée).
  - Fin de sieste cohérente (après le début).
- **Statut** : En cours
- **Contraintes / Dépendances** : US-13, US-23.
- **Description technique** : Détails stockés en JSON (début, fin). **Avancement** : parties 1 à 3 faites : formulaire, enregistrement par la Server Action `createEvent` (`app/staff/children/[id]/events/new/actions.ts` : rôle staff vérifié, auteur lu côté serveur, champs revalidés, heure de Paris), retour à la fiche où l'événement apparaît avec ses détails. Reste à tester avec un compte staff et des données (US-18) avant de passer en « Terminé ».

### US-26 – Saisie d'une activité
- **User Story** : En tant que staff, je veux noter une activité, afin de partager la journée de l'enfant.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Titre de l'activité et commentaire optionnel.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-13, US-23.
- **Description technique** : Même mécanique que US-24. **Avancement** : parties 1 à 3 faites : formulaire, enregistrement par la Server Action `createEvent` (`app/staff/children/[id]/events/new/actions.ts` : rôle staff vérifié, auteur lu côté serveur, champs revalidés, heure de Paris), retour à la fiche où l'événement apparaît avec ses détails. Reste à tester avec un compte staff et des données (US-18) avant de passer en « Terminé ».

### US-27 – Saisie d'un incident
- **User Story** : En tant que staff, je veux signaler un incident, afin que les parents soient informés clairement.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Description obligatoire de l'incident.
  - L'incident est mis en évidence dans la timeline.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-13, US-23.
- **Description technique** : Type `incident`, style visuel distinct (couleur d'erreur de la charte). **Avancement** : parties 1 à 3 faites : formulaire, enregistrement par la Server Action `createEvent` (`app/staff/children/[id]/events/new/actions.ts` : rôle staff vérifié, auteur lu côté serveur, champs revalidés, heure de Paris), retour à la fiche où l'événement apparaît avec ses détails. Reste à tester avec un compte staff et des données (US-18) avant de passer en « Terminé ».

### US-28 – Saisie d'un médicament avec blocage
- **User Story** : En tant que staff, je veux saisir un médicament administré, tout en étant bloqué si l'autorisation parentale manque, afin de respecter la sécurité de l'enfant.
- **Entité** : `events`, `medication_authorizations`
- **Critères d'acceptation** :
  - Sans autorisation confirmée et valide, l'enregistrement est refusé avec un message explicite.
  - Avec autorisation, l'événement est créé (médicament, dose, heure).
  - Le blocage fonctionne même si on contourne l'interface.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-14, US-23. **Règle métier critique.**
- **Description technique** : Contrôle double : interface (bouton désactivé) et base de données (trigger / RLS). **Avancement** : parties 1 à 3 faites : formulaire, enregistrement par la Server Action `createEvent` (`app/staff/children/[id]/events/new/actions.ts` : rôle staff vérifié, auteur lu côté serveur, champs revalidés, heure de Paris), retour à la fiche où l'événement apparaît avec ses détails. Reste à tester avec un compte staff et des données (US-18) avant de passer en « Terminé ». Médicament : autorisation revérifiée avec `findValidAuthorization`, `authorization_id` rempli ; verrou en base à faire (US-14).

### US-29 – Gestion des autorisations de médicaments
- **User Story** : En tant que staff, je veux enregistrer l'autorisation confirmée d'un parent, afin de pouvoir ensuite saisir le médicament.
- **Entité** : `medication_authorizations`
- **Critères d'acceptation** :
  - Création d'une autorisation : enfant, médicament, période de validité.
  - Possibilité de la révoquer ou de la laisser expirer.
  - Liste des autorisations actives par enfant.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-14, US-23.
- **Description technique** : Écran dédié dans la fiche enfant.

### US-30 – Timeline côté staff
- **User Story** : En tant que staff, je veux consulter la timeline d'un enfant, afin de voir ce qui a déjà été saisi dans la journée.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Événements classés du plus récent au plus ancien.
  - Filtre par jour.
  - Chaque événement montre son type, son heure et son auteur.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-13, US-23.
- **Description technique** : Fiche enfant `/staff/children/[id]` : identité, section, allergies (nouvelle colonne `children.allergies`), « Autorisation médicament : oui / non » (autorisation valide aujourd'hui), prénoms des parents, messages « nouveau » des parents, timeline du jour en ordre chronologique (icône, heure, « Saisi par [Prénom] », incidents mis en évidence), sélecteur de date (`?date=AAAA-MM-JJ`, jours précédent / suivant), état vide, bouton « Ajouter un événement » provisoire (« Bientôt disponible »). Journées calculées à l'heure de Paris. Reste à tester avec des données (US-18) ; timeline extraite en composant partagé avec l'espace parent (US-31), couleur et icône distinctes par type, durée de sieste, gravité « urgent » mise en évidence. Idée : bouton « Marquer comme traité » sur les messages directement depuis la fiche (US-36).

---

# Phase 7 – Espace Parents

### US-31 – Timeline de mon enfant
- **User Story** : En tant que parent, je veux consulter la journée de mon enfant, afin de rester informé.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Je vois uniquement les événements de mes enfants.
  - Lecture seule : aucune modification possible.
  - Filtre par jour.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-16, US-20, US-30.
- **Description technique** : Réutilise le composant timeline, données protégées par RLS. **Avancement** : accueil `/parent` (`app/parent/(home)/`) : une carte par enfant rattaché (photo ou initiales, dernier événement du jour avec icône, heure de Paris, résumé lisible et « Saisi par »), bouton « Envoyer un message à l'équipe », états chargement (squelettes), vide et erreur (« Réessayer »). Lecture avec le client de la personne connectée (RLS) + filtre `parent_children` en plus. Timeline `/parent/children/[id]` : accès vérifié côté serveur via `parent_children` (sinon retour à `/parent`), événements du jour du plus récent au plus ancien, sélecteur de date sans futur, squelettes / vide / erreur. Composants partagés avec le staff : `components/event-timeline.tsx`, `components/day-picker.tsx`. Page provisoire `/parent/messages/new`. Reste à tester avec deux comptes parents (US-40).

### US-32 – Mention de l'auteur
- **User Story** : En tant que parent, je veux savoir qui a saisi chaque événement, afin d'avoir confiance dans l'information.
- **Entité** : `events`, `profiles`
- **Critères d'acceptation** :
  - Chaque événement affiche « Saisi par [Prénom] ».
- **Statut** : En cours
- **Contraintes / Dépendances** : US-31. **Règle métier.**
- **Description technique** : Jointure `events` → `profiles`. Ne pas exposer d'autres données du profil. **Avancement** : un parent ne peut pas lire `profiles` (RLS) : le prénom vient de la fonction sécurisée `get_event_authors(p_event_ids)` (un seul appel par page, client du parent, helper `lib/event-authors.ts`), sur l'accueil et la timeline parent. Sans prénom ou si l'appel échoue : « Saisi par l'équipe » (erreur notée dans les logs serveur). Reste à tester avec un compte parent (US-40).

### US-33 – Parent avec plusieurs enfants
- **User Story** : En tant que parent de plusieurs enfants, je veux passer facilement de l'un à l'autre, afin de tout suivre depuis un seul compte.
- **Entité** : `parent_children`
- **Critères d'acceptation** :
  - Un sélecteur d'enfant est visible si j'en ai plusieurs.
  - L'interface est utilisable sur téléphone.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-31.
- **Description technique** : Sélecteur ShadCN, design « mobile d'abord ». **Avancement** : l'accueil parent affiche déjà une carte par enfant ; le sélecteur sur la fiche enfant reste à faire.

---

# Phase 8 – Messagerie parents → équipe

### US-34 – Envoi d'un message par le parent
- **User Story** : En tant que parent, je veux écrire à l'équipe, afin de poser une question ou prévenir d'un changement.
- **Entité** : `messages`
- **Critères d'acceptation** :
  - Texte limité à 500 caractères avec compteur visible.
  - Un message vide ou trop long est refusé.
  - Confirmation d'envoi affichée.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-15, US-16.
- **Description technique** : Validation côté interface et côté base (contrainte de longueur). **Avancement** : page `/parent/messages/new` : choix de l'enfant (présélectionné s'il n'y en a qu'un), compteur « x / 500 », bouton désactivé pendant l'envoi, confirmation « Votre message a bien été transmis à l'équipe », historique du parent (Envoyé / Lu par l'équipe / Traité), états chargement / vide / erreur. Server Action `sendMessage` : rôle parent, `parent_id` lu côté serveur, lien `parent_children` vérifié, texte revérifié, statut `nouveau` fixé côté serveur. Commentaire TODO « envoyer un email Resend au staff ici » placé dans le code (US-38). Reste à tester avec deux comptes parents (US-40).

### US-35 – Liste des messages pour le staff
- **User Story** : En tant que staff, je veux voir tous les messages reçus, afin de ne rien oublier.
- **Entité** : `messages`
- **Critères d'acceptation** :
  - Liste triée du plus récent au plus ancien.
  - Badge par statut (nouveau, lu, traité) ; les nouveaux ressortent.
  - Le message indique le parent et l'enfant concernés.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-15, US-17.
- **Description technique** : Page `/staff/messages` (`app/staff/messages/`), du plus récent au plus ancien, prénom du parent et de l'enfant, date et heure de Paris. Lien « Messages » avec le nombre de nouveaux dans le menu staff (`app/staff/layout.tsx`). Reste à tester avec des données (US-18). Idée : filtre par statut si la liste devient longue.

### US-36 – Traitement d'un message
- **User Story** : En tant que staff, je veux changer le statut d'un message, afin de suivre ce qui a été traité.
- **Entité** : `messages`
- **Critères d'acceptation** :
  - Passage de « nouveau » à « lu » (au clic) puis « traité » (bouton) ; jamais de retour en arrière.
  - Le nom de la personne qui a traité est conservé.
  - Le parent ne peut pas changer le statut.
- **Statut** : En cours
- **Contraintes / Dépendances** : US-35.
- **Description technique** : Server Actions `markAsRead` et `markAsHandled` (`app/staff/messages/actions.ts`) : rôle staff vérifié, `handled_by` lu côté serveur, `handled_at` = maintenant, mise à jour conditionnelle sur le statut actuel. Si la RLS refuse la modification, un message l'explique (aucun contournement). Reste à vérifier que la politique RLS de mise à jour autorise bien le staff.

---

# Phase 9 – Emails transactionnels (Resend)

### US-37 – Email d'invitation
- **User Story** : En tant que parent invité, je veux recevoir un email clair, afin de créer mon compte facilement.
- **Entité** : Invitation
- **Critères d'acceptation** :
  - Email aux couleurs de la crèche, avec un lien d'activation fonctionnel.
  - Envoi automatique dès que le staff invite un parent.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-21.
- **Description technique** : Resend, clé API stockée en variable d'environnement serveur (jamais `NEXT_PUBLIC_`). Domaine d'envoi à valider.

### US-38 – Alerte email à l'arrivée d'un message
- **User Story** : En tant que staff, je veux être prévenu par email d'un nouveau message, afin de répondre vite.
- **Entité** : `messages`
- **Critères d'acceptation** :
  - Un email part à l'équipe à chaque nouveau message parent.
  - L'email contient un lien vers la liste des messages.
  - L'envoi d'email qui échoue n'empêche pas l'enregistrement du message.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-34, US-37.
- **Description technique** : Envoi côté serveur après enregistrement du message.

---

# Phase 10 – Tests automatisés (Playwright)

### US-39 – Test du blocage médicament
- **User Story** : En tant que développeur, je veux un test qui vérifie le blocage, afin de ne jamais casser cette règle critique.
- **Entité** : `events`, `medication_authorizations`
- **Critères d'acceptation** :
  - Sans autorisation, la saisie échoue.
  - Avec autorisation, la saisie réussit.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-28, US-29.
- **Description technique** : Playwright sur l'environnement de test, comptes fictifs de US-18.

### US-40 – Test d'isolation des parents
- **User Story** : En tant que développeur, je veux vérifier qu'un parent ne voit pas les autres enfants, afin de garantir la confidentialité.
- **Entité** : RLS
- **Critères d'acceptation** :
  - Un parent connecté ne voit que ses enfants.
  - L'accès direct à une page staff est refusé.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-16, US-20.
- **Description technique** : Deux comptes parents fictifs, vérification des listes et des accès directs. À vérifier aussi : un parent lit bien les événements de ses enfants et le prénom de l'auteur (« Saisi par ») ; `/parent/children/[id]` d'un autre enfant renvoie une 404.

### US-41 – Test du parcours de saisie staff
- **User Story** : En tant que développeur, je veux tester le parcours principal, afin de détecter vite les régressions.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Connexion staff, choix d'un enfant, saisie d'un repas, vérification dans la timeline parent.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-24, US-31.
- **Description technique** : Test bout en bout avec Playwright, lancé avant chaque fusion vers `main`.

---

# Phase 11 – Mise en production

### US-42 – Base de production prête
- **User Story** : En tant que développeur, je veux appliquer le schéma sur la production, afin que l'application réelle ait les mêmes tables et règles que le test.
- **Entité** : Infrastructure
- **Critères d'acceptation** :
  - Tables et règles de sécurité identiques au projet de test.
  - Aucune donnée de test dans la production.
  - Variables Vercel Production pointent vers `lespetitspas-prod`.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-04, US-17.
- **Description technique** : Application des migrations SQL du dossier `supabase/migrations/` sur le projet de production.

### US-43 – Recette finale et mise en ligne
- **User Story** : En tant que porteur du projet, je veux valider l'application complète avant ouverture, afin de lancer sans mauvaise surprise.
- **Entité** : Déploiement
- **Critères d'acceptation** :
  - Tous les tests Playwright passent.
  - Parcours staff et parent vérifiés sur téléphone et tablette.
  - PR `staging` → `main` fusionnée, production en ligne.
- **Statut** : À faire
- **Contraintes / Dépendances** : US-08, US-39 à US-42.
- **Description technique** : Checklist de recette notée dans `JOURNAL.md`.
