import type { Partner } from '../lib/supabase';

type Props = {
  partners: Partner[];
  onSelectCafe: (partner: Partner) => void;
};

function OfferCard({ partner, onSelect }: { partner: Partner; onSelect: () => void }) {
  const menuText = partner.daily_menus[0]?.menu_text ?? '';

  return (
    <article
      onClick={onSelect}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Cover photo */}
      {partner.cover_photo_url ? (
        <div className="h-36 overflow-hidden">
          <img
            src={partner.cover_photo_url}
            alt={partner.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-brand-50 to-green-100 flex items-center justify-center text-5xl">
          🍴
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-bold text-gray-900 text-lg leading-tight">{partner.name}</h2>
          {partner.bonus_info && (
            <span className="flex-shrink-0 text-xs bg-brand-50 text-brand-700 font-semibold px-2 py-1 rounded-full">
              🎁 Offer
            </span>
          )}
        </div>

        {partner.description && (
          <p className="text-sm text-gray-500 mb-2">{partner.description}</p>
        )}

        {partner.bonus_info && (
          <p className="text-sm font-medium text-brand-700 mb-3">✨ {partner.bonus_info}</p>
        )}

        {menuText && (
          <p className="text-xs text-gray-400 line-clamp-2 whitespace-pre-line">{menuText}</p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="mt-3 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          Claim Bonus →
        </button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-10 bg-gray-200 rounded-xl mt-3" />
      </div>
    </div>
  );
}

export default function OffersTab({ partners, onSelectCafe }: Props) {
  if (partners.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <p className="text-4xl mb-3">🎁</p>
        <p className="font-medium">No offers available today</p>
        <p className="text-sm mt-1">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {partners.map((p) => (
        <OfferCard key={p.id} partner={p} onSelect={() => onSelectCafe(p)} />
      ))}
    </div>
  );
}

export { SkeletonCard };
