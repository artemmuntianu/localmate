import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json() as
    | { codeId: string }
    | { partnerId: string; numericCode: string };

  let codeId: string;

  if ('codeId' in body) {
    // QR scan flow: confirm by UUID directly
    codeId = body.codeId;
  } else {
    // Manual entry flow: look up unconfirmed code by numeric value + partner
    const { data, error } = await supabase
      .from('bonus_codes')
      .select('id')
      .eq('partner_id', body.partnerId)
      .eq('code', body.numericCode)
      .is('confirmed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ error: 'Code not found or already used' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    codeId = data.id;
  }

  const { error } = await supabase
    .from('bonus_codes')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', codeId)
    .is('confirmed_at', null); // idempotent

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to confirm' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
