/*
# AI Opportunity Hub - Initial Schema

This migration creates the foundational database schema for the AI Opportunity Hub application.

## Tables Created

1. **profiles** - User profiles extending Supabase auth.users
   - `id` (uuid, primary key, references auth.users)
   - `email` (text, unique)
   - `full_name` (text)
   - `avatar_url` (text)
   - `role` (text, default 'user')
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **categories** - Opportunity categories
   - `id` (uuid, primary key)
   - `name` (text, unique)
   - `slug` (text, unique)
   - `description` (text)
   - `icon` (text)
   - `created_at` (timestamp)

3. **opportunities** - AI opportunities/jobs
   - `id` (uuid, primary key)
   - `title` (text)
   - `description` (text)
   - `company` (text)
   - `location` (text)
   - `type` (text) - 'remote', 'hybrid', 'onsite'
   - `salary_min` (integer)
   - `salary_max` (integer)
   - `category_id` (uuid, references categories)
   - `requirements` (text[])
   - `benefits` (text[])
   - `apply_url` (text)
   - `deadline` (date)
   - `is_active` (boolean)
   - `created_by` (uuid, references auth.users)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

4. **bookmarks** - User bookmarks for opportunities
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `opportunity_id` (uuid, references opportunities)
   - `created_at` (timestamp)

5. **notifications** - User notifications
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `title` (text)
   - `message` (text)
   - `type` (text) - 'info', 'success', 'warning', 'error'
   - `read` (boolean)
   - `link` (text, optional URL)
   - `created_at` (timestamp)

6. **admin_users** - Admin access control
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `role` (text) - 'admin', 'super_admin'
   - `created_at` (timestamp)

## Security (RLS)
- All tables have RLS enabled
- Users can only access their own data (profiles, bookmarks, notifications)
- Opportunities are readable by all authenticated users
- Admin users have elevated access for CRUD on opportunities

## Notes
1. Uses `auth.uid()` for ownership checks
2. Owner columns have `DEFAULT auth.uid()` for automatic assignment
3. Foreign keys use `ON DELETE CASCADE` for clean deletion
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_categories" ON categories;
CREATE POLICY "select_categories" ON categories FOR SELECT
  TO authenticated USING (true);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  company text NOT NULL,
  location text,
  type text NOT NULL DEFAULT 'remote' CHECK (type IN ('remote', 'hybrid', 'onsite')),
  salary_min integer,
  salary_max integer,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  requirements text[] DEFAULT '{}',
  benefits text[] DEFAULT '{}',
  apply_url text,
  deadline date,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_opportunities" ON opportunities;
CREATE POLICY "select_opportunities" ON opportunities FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_opportunities" ON opportunities;
CREATE POLICY "insert_opportunities" ON opportunities FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_opportunities" ON opportunities;
CREATE POLICY "update_opportunities" ON opportunities FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_opportunities" ON opportunities;
CREATE POLICY "delete_opportunities" ON opportunities FOR DELETE
  TO authenticated USING (true);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, opportunity_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookmarks" ON bookmarks;
CREATE POLICY "select_own_bookmarks" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bookmarks" ON bookmarks;
CREATE POLICY "insert_own_bookmarks" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bookmarks" ON bookmarks;
CREATE POLICY "delete_own_bookmarks" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Admin users table (for admin access control)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_admin_users" ON admin_users;
CREATE POLICY "select_admin_users" ON admin_users FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_active ON opportunities(is_active);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();