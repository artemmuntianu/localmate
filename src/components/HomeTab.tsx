import type { Organization } from '../lib/supabase';

type Props = {
  org: Organization;
};

export default function HomeTab({ org }: Props) {
  return (
    <div className="flex flex-col items-center px-6 pt-10 pb-6 text-center">
      {org.logo_url ? (
        <img
          src={org.logo_url}
          alt={org.name}
          className="w-20 h-20 rounded-2xl object-cover mb-4 shadow-sm"
        />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center text-4xl mb-4 shadow-sm">
          🏢
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{org.name}</h1>

      <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
        {org.welcome_text ?? 'Scan the QR code at your desk to access today\'s lunch menus and exclusive bonuses.'}
      </p>

      <div className="mt-8 w-full max-w-xs bg-brand-50 rounded-2xl p-4 text-left">
        <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2">Quick tips</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>🎁 Check the <strong>Offers</strong> tab for today's deals and bonuses</li>
          <li>🗺️ Use the <strong>Map</strong> to find cafés nearby</li>
          <li>🤖 Ask the <strong>AI concierge</strong> for a recommendation</li>
        </ul>
      </div>
    </div>
  );
}
