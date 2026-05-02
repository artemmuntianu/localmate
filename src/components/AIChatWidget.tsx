import { useState, useRef, useEffect } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };
type Menu = { partnerName: string; menuText: string };

export default function AIChatWidget({ menus }: { menus: Menu[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const firstMessage = useRef(true);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    if (firstMessage.current) {
      window.posthog?.capture('chat_interaction');
      firstMessage.current = false;
    }

    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, menus }),
      });
      const { reply } = await res.json();
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: "Can't respond right now." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Toggle button */}
      {!open && (
        <div className="max-w-lg mx-auto px-4 pb-4">
          <button
            onClick={() => setOpen(true)}
            className="w-full py-3 rounded-2xl bg-white border border-gray-200 shadow-lg text-gray-600 font-medium flex items-center justify-center gap-2 hover:shadow-xl transition-shadow"
          >
            <span>🤖</span>
            <span>Ask the AI concierge</span>
          </button>
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div className="max-w-lg mx-auto bg-white border-t border-gray-200 shadow-2xl flex flex-col" style={{ height: '60vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span>🤖</span>
              <span className="font-semibold text-gray-800">LocalMate AI</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-sm pt-4">
                Hi! Ask me anything about today's menu 🍽️
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 px-3 py-2 rounded-2xl rounded-bl-sm text-sm">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 px-3 py-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="What should I grab if I'm short on time?"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
