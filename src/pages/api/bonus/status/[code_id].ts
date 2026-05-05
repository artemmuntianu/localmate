import type { APIRoute } from 'astro';
import { supabase } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ params }) => {
  const { data } = await supabase
    .from('bonus_codes')
    .select('confirmed_at')
    .eq('id', params.code_id!)
    .single();

  return new Response(JSON.stringify({ confirmed: !!data?.confirmed_at }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
