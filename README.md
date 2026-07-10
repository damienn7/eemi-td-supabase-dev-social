# eemi-td-supabase-dev-social

# DevSocial

Mini réseau social développé avec Next.js App Router, TypeScript et Supabase.

## Membres

- Nom 1
- Nom 2

> Remplacez ces placeholders par vos noms réels avant de rendre le projet.

## Installation

```bash
npm install
```

## Variables d'environnement

Créez un fichier `.env.local` dans le dossier `dev-social` avec les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Ne mettez jamais de clé privée ou de service role key dans le dépôt.

## Commandes utiles

```bash
npm run dev
npm run build
npm run lint
```

## Structure du projet

- `app/` : pages et routes Next.js App Router
- `app/auth/` : pages de connexion et d'inscription
- `app/posts/` : formulaire et actions de gestion des posts
- `app/profile/` : page profil et upload avatar
- `app/post/[id]/` : page détail d'un post avec commentaires et like
- `app/components/` : composants partagés
- `utils/supabase/client.ts` : client Supabase pour le navigateur
- `utils/supabase/server.ts` : client Supabase pour le serveur
- `sql/0001_dev_social_comments_likes_avatars_rls.sql` : migration SQL de base

## Routes principales

- `/` : accueil, fil d'actualité, posts, likes, commentaires
- `/auth/login` : connexion
- `/auth/signup` : inscription
- `/profile` : profil utilisateur, avatar, suppression avatar
- `/post/[id]` : détail du post, commentaires, like
- `/posts` : gestion des posts
- `/feed` : fil (temps réel si activé)

## Supabase

1. Créez un projet Supabase.
2. Ajoutez les variables d'environnement dans `.env.local`.
3. Appliquez la migration SQL :
   - `sql/0001_dev_social_comments_likes_avatars_rls.sql`
4. Vérifiez que les tables existent : `profiles`, `posts`, `comments`, `likes`.
5. Créez un bucket Storage `avatars` si nécessaire.

### Sécurité et RLS

- `profiles`, `posts`, `comments`, `likes` doivent avoir RLS activé.
- Lecture publique autorisée.
- Insertion uniquement par l'utilisateur propriétaire.
- Update/delete uniquement par le propriétaire.
- Ne pas désactiver RLS dans le code.

## Stockage des avatars

- Bucket : `avatars`
- Chemin stocké : `${user.id}/avatar.png`
- `profiles.avatar_url` contient l'URL publique du fichier
- Upload et suppression depuis `/profile`

## Notes importantes

- Le projet utilise `@supabase/ssr` pour gérer la session côté serveur.
- Les lectures initiales sont en Server Components, les mutations en Server Actions.
- La page `app/post/[id]` gère les commentaires via une action serveur et revalide le contenu.

## Partage Supabase

Si l'enseignant doit accéder au projet Supabase, partagez le projet via l'interface Supabase avec son e-mail.
