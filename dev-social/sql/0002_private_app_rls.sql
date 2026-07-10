-- DevSocial devient une application privée : les lectures et mutations sont réservées aux utilisateurs connectés.
-- Cette migration retire les anciennes policies de lecture publique et les remplace par des policies "to authenticated".

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.likes ENABLE ROW LEVEL SECURITY;

-- Ancienne migration locale : comments.user_id. Le code applicatif attend comments.author_id.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'comments'
      AND column_name = 'user_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'comments'
      AND column_name = 'author_id'
  ) THEN
    ALTER TABLE public.comments RENAME COLUMN user_id TO author_id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'comments_user_id_fkey'
      AND conrelid = 'public.comments'::regclass
  ) THEN
    ALTER TABLE public.comments RENAME CONSTRAINT comments_user_id_fkey TO comments_author_id_fkey;
  END IF;
END $$;

DROP POLICY IF EXISTS "Profiles public select" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Posts public select" ON public.posts;
DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;
DROP POLICY IF EXISTS "Posts are readable by authenticated users" ON public.posts;
CREATE POLICY "Posts are readable by authenticated users"
ON public.posts
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Posts insert owner" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
CREATE POLICY "Users can create their own posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Posts update owner" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Posts delete owner" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Comments public select" ON public.comments;
DROP POLICY IF EXISTS "Comments are publicly readable" ON public.comments;
DROP POLICY IF EXISTS "Comments are readable by authenticated users" ON public.comments;
CREATE POLICY "Comments are readable by authenticated users"
ON public.comments
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Comments insert owner" ON public.comments;
DROP POLICY IF EXISTS "Users can create their own comments" ON public.comments;
CREATE POLICY "Users can create their own comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Comments update owner" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Comments delete owner" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Likes public select" ON public.likes;
DROP POLICY IF EXISTS "Likes are publicly readable" ON public.likes;
DROP POLICY IF EXISTS "Likes are readable by authenticated users" ON public.likes;
CREATE POLICY "Likes are readable by authenticated users"
ON public.likes
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Likes insert owner" ON public.likes;
DROP POLICY IF EXISTS "Users can like as themselves" ON public.likes;
CREATE POLICY "Users can like as themselves"
ON public.likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Likes delete owner" ON public.likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.likes;
CREATE POLICY "Users can unlike their own likes"
ON public.likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
