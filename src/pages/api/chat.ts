import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);

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

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

  // Format messages for Gemini API
  const conversationHistory = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood. I will follow these rules.' }] },
    ...messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  ];

  const chat = model.startChat({ history: conversationHistory.slice(0, -1) });
  const result = await chat.sendMessage(conversationHistory[conversationHistory.length - 1].parts[0].text);
  const reply = result.response.text() ?? "Can't respond right now.";

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
