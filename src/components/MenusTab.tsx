import BonusClaimFlow from './BonusClaimFlow';
import type { Partner } from '../lib/supabase';

type Props = {
  partners: Partner[];
};

function PartnerCard({ partner }: { partner: Partner }) {
  const menuText = partner.daily_menus[0]?.menu_text ?? '';
  const hasMenu = !!menuText;

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl flex-shrink-0">
            🍴
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 truncate">{partner.name}</h2>
          {partner.description && (
            <p className="text-sm text-gray-500 truncate">{partner.description}</p>
          )}
        </div>
        {partner.bonus_info && (
          <span className="flex-shrink-0 text-xs bg-brand-50 text-brand-700 font-semibold px-2 py-1 rounded-full">
            🎁 Bonus
          </span>
        )}
      </div>

      {hasMenu ? (
        <div className="px-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Today's menu</p>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 whitespace-pre-line">{menuText}</p>
        </div>
      ) : (
        <div className="px-4 pb-2">
          <p className="text-sm text-gray-400 italic">No menu added for today</p>
        </div>
      )}

      {partner.bonus_info && (
        <div className="px-4 pb-4 pt-2">
          <p className="text-sm text-gray-600 mb-1">{partner.bonus_info}</p>
          <BonusClaimFlow partnerId={partner.id} bonusInfo={partner.bonus_info} />
        </div>
      )}
    </article>
  );
}

export default function MenusTab({ partners }: Props) {
  if (partners.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <p className="text-4xl mb-3">🌿</p>
        <p className="font-medium">No menu added for today yet</p>
        <p className="text-sm mt-1">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {partners.map((partner) => (
        <PartnerCard key={partner.id} partner={partner} />
      ))}
    </div>
  );
}
