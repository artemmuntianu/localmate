import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type Partner = {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  credit_balance: number;
  bonus_info: string | null;
  daily_menus: { menu_text: string }[];
};
