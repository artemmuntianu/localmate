import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const { partnerId, existingCodeId } = await request.json() as {
    partnerId: string;
    existingCodeId?: string;
  };

  // If client already has a code, check if it's still unconfirmed and reuse it
  if (existingCodeId) {
    const { data: existing } = await supabase
      .from('bonus_codes')
      .select('id, code, confirmed_at')
      .eq('id', existingCodeId)
      .single();

    if (existing && !existing.confirmed_at) {
      return json({ codeId: existing.id, code: existing.code });
    }
  }

  // Generate new 6-digit numeric code
  const code = String(Math.floor(100000 + Math.random() * 900000));

  const { data, error } = await supabase
    .from('bonus_codes')
    .insert({ partner_id: partnerId, code })
    .select('id')
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: 'Failed to generate code' }), { status: 500 });
  }

  return json({ codeId: data.id, code });
};

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });
}
