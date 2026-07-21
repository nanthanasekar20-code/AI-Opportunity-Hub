/**
 * Real Supabase client for AI Opportunity Hub.
 *
 * This connects to the Supabase project configured via VITE_SUPABASE_URL /
 * VITE_SUPABASE_ANON_KEY (see `.env`), using the schema already applied by
 * `supabase/migrations/*.sql`. No tables are created or modified here.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string | null;
  type: 'remote' | 'hybrid' | 'onsite';
  salary_min: number | null;
  salary_max: number | null;
  category_id: string | null;
  requirements: string[];
  benefits: string[];
  apply_url: string | null;
  deadline: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
};

export type Bookmark = {
  id: string;
  user_id: string;
  opportunity_id: string;
  created_at: string;
  opportunity?: Opportunity | null;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link: string | null;
  created_at: string;
};

export type AdminUser = {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
  created_at: string;
};
