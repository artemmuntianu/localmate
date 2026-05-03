import { useState, useEffect } from 'react';

const GDPR_KEY     = 'lm_gdpr_accepted';
const ANALYTICS_KEY = 'lm_analytics_enabled';

export default function GdprModal() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem(GDPR_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(GDPR_KEY, '1');
    localStorage.setItem(ANALYTICS_KEY, analytics ? '1' : '0');
    if (analytics) window.__lm_initPostHog?.();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🔒</span>
          <h2 className="text-lg font-bold text-gray-900">Privacy Notice</h2>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          LocalMate stores your preferences (language, bonus history) in your browser's
          local storage. No personal data leaves your device unless you choose below.
        </p>

        <ul className="text-sm text-gray-500 space-y-1 mb-5">
          <li>✅ No account or login required</li>
          <li>✅ Your anonymous ID is used only to track your own bonus redemptions</li>
          <li>✅ Clear everything at any time via your browser's "Clear site data"</li>
        </ul>

        {/* Analytics toggle */}
        <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer mb-5 hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Help improve LocalMate</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Share anonymous usage data (screen interactions, tab switches) via PostHog.
              No names, emails, or personal info — ever.
            </p>
          </div>
          <div className="flex-shrink-0 mt-0.5">
            <div
              onClick={() => setAnalytics((a) => !a)}
              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                analytics ? 'bg-brand-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  analytics ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </div>
        </label>

        <button
          onClick={accept}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
        >
          Accept & Continue
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          By continuing you agree to our{' '}
          <span className="underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
