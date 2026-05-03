import { useState, useRef, useEffect, useMemo } from 'react';
import type { Partner } from '../lib/supabase';

type Message = { role: 'user' | 'assistant'; content: string };
type Menu = { partnerName: string; menuText: string };
type Faq = { question: string; answer: string };

type Props = {
  menus: Menu[];
  partners: Partner[];
  orgSlug: string;
  faqs: Faq[];
  onOpenCafe: (partnerId: string) => void;
};

const LANG_KEY = 'lm_lang';

const LANGUAGES = [
  { code: 'gb', country: 'United Kingdom', language: 'English (UK)' },
  { code: 'us', country: 'United States',  language: 'English (US)' },
  { code: 'pt', country: 'Portugal',       language: 'Português (Portugal)' },
  { code: 'br', country: 'Brazil',         language: 'Português (Brasil)' },
  { code: 'es', country: 'Spain',          language: 'Español' },
  { code: 'fr', country: 'France',         language: 'Français' },
  { code: 'de', country: 'Germany',        language: 'Deutsch' },
  { code: 'it', country: 'Italy',          language: 'Italiano' },
  { code: 'nl', country: 'Netherlands',    language: 'Nederlands' },
  { code: 'pl', country: 'Poland',         language: 'Polski' },
];

function MessageContent({
  text,
  partners,
  onOpenCafe,
}: {
  text: string;
  partners: Partner[];
  onOpenCafe: (id: string) => void;
}) {
  const parts = text.split(/\[\[([^\]]+)\]\]/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const match = partners.find((p) =>
            p.name.toLowerCase().includes(part.toLowerCase())
          );
          return match ? (
            <button
              key={i}
              onClick={() => onOpenCafe(match.id)}
              className="inline-flex items-center gap-1 bg-white/30 hover:bg-white/50 underline rounded px-1 font-semibold transition-colors"
            >
              {part} →
            </button>
          ) : (
            <strong key={i}>{part}</strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function SmartChatWidget({ menus, partners, orgSlug, faqs, onOpenCafe }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<string | null>(null);
  const [customLang, setCustomLang] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const starters = useMemo(() => {
    const shuffled = [...faqs].sort(() => Math.random() - 0.5).slice(0, 2);
    return [...shuffled.map((f) => f.question), 'Where is a good place to eat near here?'];
  }, [faqs]);

  useEffect(() => {
    setLang(localStorage.getItem(LANG_KEY));
  }, []);

  useEffect(() => {
    if (expanded) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, expanded]);

  function selectLang(chosen: string) {
    localStorage.setItem(LANG_KEY, chosen);
    setLang(chosen);
    setMessages([{
      role: 'assistant',
      content: `Hello! 👋 I can help you find the perfect lunch or answer questions about this space. What do you need?`,
    }]);
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setExpanded(true);

    const next: Message[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, menus, language: lang ?? 'English (UK)', orgSlug }),
      });
      const { reply } = await res.json();
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: "Can't respond right now." }]);
    } finally {
      setLoading(false);
    }
  }

  const showLangSelect = expanded && lang === null;
  const showStarters = expanded && lang !== null && messages.length === 0 && !loading;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Expanded panel — slides up from the bottom bar */}
      {expanded && (
        <div
          className="max-w-lg mx-auto bg-white border-t border-x border-gray-200 shadow-2xl flex flex-col"
          style={{ height: '60vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span>🤖</span>
              <span className="font-semibold text-gray-800">LocalMate AI</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ↓
            </button>
          </div>

          {/* Language selection */}
          {showLangSelect && (
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              <p className="text-center text-gray-700 font-medium text-sm">👋 Pick your language</p>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => selectLang(l.language)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:border-brand-500 hover:text-brand-600 transition-colors text-left"
                  >
                    <img
                      src={`https://flagcdn.com/w20/${l.code}.png`}
                      srcSet={`https://flagcdn.com/w40/${l.code}.png 2x`}
                      alt={l.country}
                      className="w-5 h-4 rounded-sm object-cover shrink-0"
                    />
                    <span className="truncate text-gray-700">{l.country}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customLang}
                  onChange={(e) => setCustomLang(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customLang.trim()) selectLang(customLang.trim());
                  }}
                  placeholder="Other language…"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
                <button
                  onClick={() => { if (customLang.trim()) selectLang(customLang.trim()); }}
                  disabled={!customLang.trim()}
                  className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          {!showLangSelect && (
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && !loading && (
                <p className="text-center text-gray-400 text-sm pt-2">
                  Hi! Ask me anything about today's offers 🍽️
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <MessageContent
                        text={m.content}
                        partners={partners}
                        onOpenCafe={(id) => { setExpanded(false); onOpenCafe(id); }}
                      />
                    ) : (
                      m.content
                    )}
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
              {showStarters && (
                <div className="flex flex-col gap-2 pt-2">
                  <p className="text-xs text-gray-400 text-center">Quick questions</p>
                  {starters.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="text-left text-sm px-3 py-2 border border-gray-200 rounded-xl hover:border-brand-400 hover:text-brand-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      )}

      {/* Always-visible input bar */}
      <div className="max-w-lg mx-auto bg-white border-t border-gray-200 px-3 py-2 flex gap-2 items-center">
        {lang === null ? (
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 text-left text-sm text-gray-400 border border-gray-200 rounded-xl px-3 py-2"
          >
            🌐 Choose your language to start…
          </button>
        ) : (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            onFocus={() => setExpanded(true)}
            placeholder="Ask about offers, hours, food…"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        )}
        {lang !== null && (
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="shrink-0 bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
