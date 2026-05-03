import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../lib/supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);

type Menu = { partnerName: string; menuText: string };
type Message = { role: 'user' | 'assistant'; content: string };

export const POST: APIRoute = async ({ request }) => {
  const {
    messages,
    menus,
    language = 'English',
    orgSlug,
  }: { messages: Message[]; menus: Menu[]; language?: string; orgSlug?: string } =
    await request.json();

  const now = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Lisbon',
  });

  const menuBlock = menus
    .map((m) => `**${m.partnerName}**: ${m.menuText}`)
    .join('\n\n');
  let faqBlock = '';
  let partnerNames: string[] = menus.map((m) => m.partnerName);

  if (orgSlug) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single();

    if (org) {
      const [{ data: faqs }, { data: partners }] = await Promise.all([
        supabase
          .from('faqs')
          .select('question, answer, category')
          .eq('org_id', org.id)
          .order('category'),
        supabase
          .from('partners')
          .select('name, bonus_info')
          .eq('org_id', org.id),
      ]);

      if (faqs?.length) {
        faqBlock =
          'Organization FAQs:\n' +
          faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
      }

      if (partners?.length) {
        partnerNames = partners.map((p) => p.name);
      }
    }
  }

  const cafeList = partnerNames.map((n) => `[[${n}]]`).join(', ');

  const systemPrompt = `You are LocalMate, a friendly and enthusiastic sales concierge for a coworking space.
Current time: ${now}. Respond in ${language}.

${faqBlock ? `SPACE INFORMATION (for questions about hours, wifi, parking, facilities):\n${faqBlock}\n\n` : ''}TODAY'S LUNCH OFFERS:
${menuBlock}

Available partner cafés: ${cafeList}

CRITICAL FORMATTING RULES:
- When you mention a specific café by name, ALWAYS wrap it like this: [[Café Name]]
- Example: "I recommend [[Café Central]] — they have a great pasta today!"
- This creates a clickable deep-link to the café's detail page.

BEHAVIOR RULES:
- Be warm, enthusiastic, and sales-oriented. You are selling the experience, not just providing info.
- Proactively mention current offers and bonuses when discussing any café.
- Keep replies short: 2–4 sentences max.
- For space questions (hours, wifi, parking), answer from the FAQ section.
- For food questions, recommend based on preferences: vegan, high protein, quick, cheap.
- If unsure, suggest the user check the Offers tab for today's deals.`;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

  const conversationHistory = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood! I will be a helpful, enthusiastic concierge and always wrap café names in [[double brackets]].' }] },
    ...messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  ];

  const chat = model.startChat({ history: conversationHistory.slice(0, -1) });
  const result = await chat.sendMessage(
    conversationHistory[conversationHistory.length - 1].parts[0].text
  );
  const reply = result.response.text() ?? "Can't respond right now.";

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
