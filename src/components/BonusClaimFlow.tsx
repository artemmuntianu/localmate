import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getAnonId } from '../lib/anon';

type State =
  | { kind: 'idle' }
  | { kind: 'claiming' }
  | { kind: 'active'; code: string; expiresAt: number }
  | { kind: 'expired' }
  | { kind: 'no_credits' }
  | { kind: 'error' };

function randomCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

type Props = {
  partnerId: string;
  bonusInfo: string | null;
};

export default function BonusClaimFlow({ partnerId, bonusInfo }: Props) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.kind === 'active') {
      setRemaining(state.expiresAt - Date.now());
      timerRef.current = setInterval(() => {
        const left = state.expiresAt - Date.now();
        if (left <= 0) {
          clearInterval(timerRef.current!);
          setState({ kind: 'expired' });
        } else {
          setRemaining(left);
        }
      }, 500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.kind === 'active' ? state.expiresAt : null]);

  async function handleClaim() {
    setState({ kind: 'claiming' });
    const userId = getAnonId();
    const { error } = await supabase.rpc('claim_bonus', {
      p_partner_id: partnerId,
      p_user_id: userId,
    });

    if (error) {
      if (error.message.includes('no_credits')) {
        setState({ kind: 'no_credits' });
      } else {
        setState({ kind: 'error' });
      }
      return;
    }

    const code = randomCode();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    setState({ kind: 'active', code, expiresAt });
    window.posthog?.capture('bonus_claimed', { partner_id: partnerId });
  }

  if (state.kind === 'idle' || state.kind === 'no_credits' || state.kind === 'error') {
    return (
      <div>
        <button
          onClick={handleClaim}
          disabled={state.kind === 'no_credits'}
          className="w-full mt-3 py-3 px-4 rounded-xl font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Claim bonus
        </button>
        {state.kind === 'no_credits' && (
          <p className="text-center text-sm text-gray-400 mt-2">Sorry, no bonuses left</p>
        )}
        {state.kind === 'error' && (
          <p className="text-center text-sm text-red-400 mt-2">Something went wrong. Try again later.</p>
        )}
      </div>
    );
  }

  if (state.kind === 'claiming') {
    return (
      <button disabled className="w-full mt-3 py-3 px-4 rounded-xl font-semibold text-white bg-brand-500 opacity-70 cursor-wait">
        Claiming…
      </button>
    );
  }

  if (state.kind === 'expired') {
    return (
      <div className="w-full mt-3 py-3 px-4 rounded-xl text-center bg-gray-100 text-gray-500 font-medium">
        Expired
      </div>
    );
  }

  // active
  return (
    <div className="fixed inset-0 z-50 bg-brand-600 flex flex-col items-center justify-center text-white p-8">
      <p className="text-sm font-medium opacity-80 mb-2">Show to the waiter</p>
      <p className="text-7xl font-black tracking-widest mb-6">{state.code}</p>
      {bonusInfo && (
        <p className="text-lg font-semibold text-center mb-8 opacity-90">{bonusInfo}</p>
      )}
      <div className="bg-white/20 rounded-2xl px-8 py-4 text-center">
        <p className="text-xs opacity-70 mb-1">Valid for</p>
        <p className="text-4xl font-bold tabular-nums">{formatTime(remaining)}</p>
      </div>
      <button
        onClick={() => setState({ kind: 'expired' })}
        className="mt-10 text-sm opacity-60 underline"
      >
        Close
      </button>
    </div>
  );
}
