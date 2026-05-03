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
  logo_url: string | null;
  welcome_text: string | null;
  lat: number | null;
  lng: number | null;
};

export type HourEntry = { days: string; hours: string };

export type Partner = {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  credit_balance: number;
  bonus_info: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  hours: HourEntry[] | null;
  cover_photo_url: string | null;
  photos: string[] | null;
  daily_menus: { menu_text: string }[];
};

export type FAQ = {
  id: string;
  org_id: string;
  question: string;
  answer: string;
  category: string | null;
  created_at: string;
};
