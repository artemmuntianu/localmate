import { useState, useEffect, useRef } from 'react';

type Props = {
  partnerId: string;
  cafeSlug: string;
  bonusInfo: string | null;
  bonusReusable: boolean;
};

type StoredBonus = { codeId: string; code: string } | { usedUp: true };

const storageKey = (id: string) => `lm_bonus_${id}`;

export default function BonusClaimFlow({ partnerId, cafeSlug, bonusInfo, bonusReusable }: Props) {
  const [open, setOpen] = useState(false);
  const [codeId, setCodeId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedUp, setUsedUp] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(partnerId));
      if (!raw) return;
      const stored: StoredBonus = JSON.parse(raw);
      if ('usedUp' in stored) setUsedUp(true);
    } catch {}
  }, [partnerId]);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => () => stopPolling(), []);

  function startPolling(id: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/bonus/status/${id}`);
        const { confirmed } = await res.json();
        if (confirmed) {
          stopPolling();
          handleConfirmed();
        }
      } catch {}
    }, 5000);
  }

  async function claim() {
    if (loading || usedUp) return;
    setLoading(true);

    try {
      let existingCodeId: string | undefined;
      try {
        const raw = localStorage.getItem(storageKey(partnerId));
        if (raw) {
          const stored: StoredBonus = JSON.parse(raw);
          if ('codeId' in stored) existingCodeId = stored.codeId;
        }
      } catch {}

      const res = await fetch('/api/bonus/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, existingCodeId }),
      });
      const data: { codeId: string; code: string } = await res.json();

      localStorage.setItem(storageKey(partnerId), JSON.stringify({ codeId: data.codeId, code: data.code }));
      setCodeId(data.codeId);
      setCode(data.code);
      setOpen(true);
      startPolling(data.codeId);
    } catch {
      // silently fail — try again next click
    } finally {
      setLoading(false);
    }
  }

  function handleConfirmed() {
    setConfirmed(true);
    setTimeout(() => setShowCheck(true), 80);
    setTimeout(() => {
      setOpen(false);
      setConfirmed(false);
      setShowCheck(false);
      if (bonusReusable) {
        localStorage.removeItem(storageKey(partnerId));
        setCodeId(null);
        setCode(null);
      } else {
        localStorage.setItem(storageKey(partnerId), JSON.stringify({ usedUp: true }));
        setUsedUp(true);
      }
    }, 2500);
  }

  function closeModal() {
    setOpen(false);
    stopPolling();
  }

  const qrUrl = codeId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${cafeSlug}/qr?code=${codeId}` : '';
  const qrSrc = qrUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`
    : '';

  const disabled = !bonusReusable && usedUp;
  const label = disabled ? 'No more bonuses' : bonusReusable ? 'Reusable bonus' : 'One-time bonus';

  return (
    <>
      <button
        onClick={claim}
        disabled={disabled || loading}
        className={`w-full py-3 rounded-2xl font-semibold text-white transition-colors ${
          disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 active:scale-95'
        }`}
      >
        {loading ? 'Generating…' : 'Claim Bonus'}
      </button>
      <p className="text-center text-xs text-gray-400 mt-1">{label}</p>

      {open && code && codeId && (
        <div
          className="fixed inset-0 z-[90] bg-black/70 flex items-end justify-center p-4 pb-8"
          onClick={confirmed ? undefined : closeModal}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmed ? (
              <div className="py-6 flex flex-col items-center gap-4">
                <div
                  className={`transition-all duration-500 ease-out ${
                    showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  } w-28 h-28 bg-green-500 rounded-full flex items-center justify-center shadow-lg`}
                >
                  <span className="text-white text-6xl leading-none select-none">✓</span>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">Bonus confirmed!</p>
                  <p className="text-sm text-gray-400 mt-1">Enjoy your meal 🍽️</p>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-5 text-gray-300 hover:text-gray-500 text-3xl leading-none"
                >
                  ×
                </button>

                {bonusInfo && <p className="font-semibold text-gray-800 mb-1">{bonusInfo}</p>}
                <p className="text-sm text-gray-400 mb-5">Show this to your waiter or let them scan</p>

                {qrSrc && (
                  <div className="flex justify-center mb-4">
                    <img src={qrSrc} alt="QR code" className="w-44 h-44 rounded-xl" />
                  </div>
                )}

                <p className="text-5xl font-mono font-bold tracking-widest text-gray-900 mb-4">
                  {code}
                </p>

                <p className="text-xs text-gray-400">Waiting for waiter to confirm…</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
