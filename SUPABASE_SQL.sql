-- ============================================================
-- FRIDAY APP — SUPABASE SQL
-- Paste this into: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url   TEXT,
  cover_url    TEXT,
  bio          TEXT,
  phone_number TEXT,
  whatsapp_number TEXT,
  is_verified  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_.]{3,30}$')
);

-- ============================================================
-- 2. POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  image_url      TEXT,
  category       TEXT CHECK (category IN ('Party','Restaurant','Campus','Public Event','Nightlife','Chill','Other')),
  location_name  TEXT,
  area           TEXT,
  event_date     DATE,
  event_time     TIME,
  price_text     TEXT,
  contact_phone  TEXT,
  whatsapp_number TEXT,
  is_featured    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. REACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reactions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id       UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'vibe',
  created_at    TIMESTAMPTZ DEFAULT now(),

  UNIQUE (post_id, user_id)  -- one reaction per user per post
);

-- ============================================================
-- 4. COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id           UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content           TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. COMMENT LIKES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (comment_id, user_id)
);

-- ============================================================
-- 6. INDEXES (performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id    ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username   ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_user_id       ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category      ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_event_date    ON public.posts(event_date);
CREATE INDEX IF NOT EXISTS idx_posts_created_at    ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id   ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id   ON public.reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id    ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id    ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);

-- ============================================================
-- 7. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    -- Generate a temp username from email prefix, sanitized
    lower(regexp_replace(split_part(NEW.email, '@', 1), '[^a-z0-9_.]', '_', 'g')) || '_' || substring(NEW.id::text, 1, 4),
    split_part(NEW.email, '@', 1)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
-- Anyone can read profiles
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Only the owner can update their profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Only the owner can insert their profile (trigger handles it, but also allow manual)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---- POSTS ----
-- Anyone can read posts
CREATE POLICY "posts_select_public"
  ON public.posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "posts_insert_auth"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the author can update/delete their post
CREATE POLICY "posts_update_own"
  ON public.posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "posts_delete_own"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- ---- REACTIONS ----
-- Anyone can read reactions
CREATE POLICY "reactions_select_public"
  ON public.reactions FOR SELECT
  USING (true);

-- Authenticated users can add reactions
CREATE POLICY "reactions_insert_auth"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their reaction
CREATE POLICY "reactions_delete_own"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ---- COMMENTS ----
-- Anyone can read comments
CREATE POLICY "comments_select_public"
  ON public.comments FOR SELECT
  USING (true);

-- Authenticated users can add comments
CREATE POLICY "comments_insert_auth"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their comment
CREATE POLICY "comments_delete_own"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ---- COMMENT LIKES ----
CREATE POLICY "comment_likes_select_public"
  ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "comment_likes_insert_auth"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_likes_delete_own"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 9. STORAGE BUCKETS (run after creating buckets in UI)
-- ============================================================
-- Go to: Supabase Dashboard → Storage → Create Bucket
-- Create three buckets:
--   1. avatars    (public: true)
--   2. covers     (public: true)
--   3. post-images (public: true)
--
-- Then run this SQL to set storage policies:

INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('covers', 'covers', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('post-images', 'post-images', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage RLS — avatars
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS — covers
CREATE POLICY "covers_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "covers_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

-- Storage RLS — post-images
CREATE POLICY "post_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "post_images_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images' AND auth.role() = 'authenticated');

-- ============================================================
-- DONE ✅
-- ============================================================
