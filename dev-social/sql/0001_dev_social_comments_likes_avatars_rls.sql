-- Ajout des tables comments et likes, du bucket avatars et des policies RLS.

-- Crée le bucket avatars si nécessaire.
-- Remarque : cette commande peut ne pas fonctionner directement dans tous les clients SQL Supabase.
-- Si votre interface SQL ne supporte pas la création de buckets, créez le bucket "avatars" manuellement dans le dashboard.
-- storage.create_bucket('avatars', true);

-- Table comments.
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Table likes.
CREATE TABLE IF NOT EXISTS likes (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Activer RLS.
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS likes ENABLE ROW LEVEL SECURITY;

-- Policies profiles.
CREATE POLICY IF NOT EXISTS "Profiles public select" ON profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Profiles insert own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Profiles delete own" ON profiles FOR DELETE USING (auth.uid() = id);

-- Policies posts.
CREATE POLICY IF NOT EXISTS "Posts public select" ON posts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Posts insert owner" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Posts update owner" ON posts FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY IF NOT EXISTS "Posts delete owner" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Policies comments.
CREATE POLICY IF NOT EXISTS "Comments public select" ON comments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Comments insert owner" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Comments update owner" ON comments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Comments delete owner" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Policies likes.
CREATE POLICY IF NOT EXISTS "Likes public select" ON likes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Likes insert owner" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Likes delete owner" ON likes FOR DELETE USING (auth.uid() = user_id);
