import type { APIRoute } from 'astro';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: import.meta.env.OPENAI_API_KEY });

type Menu = { partnerName: string; menuText: string };
type Message = { role: 'user' | 'assistant'; content: string };

export const POST: APIRoute = async ({ request }) => {
  const { messages, menus }: { messages: Message[]; menus: Menu[] } =
    await request.json();

  const now = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Lisbon',
  });

  const menuBlock = menus
    .map((m) => `${m.partnerName}:\n${m.menuText}`)
    .join('\n\n');

  const systemPrompt = `You are LocalMate, a concise lunch advisor for tech workers.
Current time: ${now}.
Today's menus:
${menuBlock}

Rules:
- Keep replies short (2-4 sentences max).
- Recommend dishes based on stated preferences: vegan, high protein, quick, cheap.
- If the question is unrelated to food, politely steer the conversation back to lunch.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 300,
  });

  const reply = completion.choices[0]?.message?.content ?? "Can't respond right now.";

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
