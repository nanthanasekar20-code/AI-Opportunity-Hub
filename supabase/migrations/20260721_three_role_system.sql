-- 1. Remove old role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Migrate existing values to new roles
UPDATE profiles SET role = 'student' WHERE role = 'user';
UPDATE profiles SET role = 'admin' WHERE role = 'super_admin';

-- 3. Set new default + new constraint
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'student';
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'teacher', 'admin'));

-- 4. Helper function so RLS policies can check "is this user an admin?"
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 5. Fix the authorization gap: only admins can write opportunities
DROP POLICY IF EXISTS "insert_opportunities" ON opportunities;
CREATE POLICY "insert_opportunities" ON opportunities FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "update_opportunities" ON opportunities;
CREATE POLICY "update_opportunities" ON opportunities FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "delete_opportunities" ON opportunities;
CREATE POLICY "delete_opportunities" ON opportunities FOR DELETE
  TO authenticated USING (public.is_admin());