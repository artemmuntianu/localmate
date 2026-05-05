import { useState, useEffect } from 'react';
import BonusClaimFlow from './BonusClaimFlow';
import ImageGallery from './ImageGallery';
import type { Partner } from '../lib/supabase';

type Props = {
  cafe: Partner;
  onBack: () => void;
};

function HoursSection({ hours }: { hours: NonNullable<Partner['hours']> }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 py-4 text-left"
      >
        <span className="text-xl w-7 text-center">🕐</span>
        <div className="flex-1">
          <p className="text-sm text-gray-800 font-medium">Hours</p>
          <p className="text-xs text-gray-400">{hours[0]?.days}: {hours[0]?.hours}</p>
        </div>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="pb-3 pl-10 space-y-1">
          {hours.map((h, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-500">{h.days}</span>
              <span className={`font-medium ${h.hours === 'Closed' ? 'text-red-400' : 'text-gray-700'}`}>
                {h.hours}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="h-64 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function CafeDetailView({ cafe, onBack }: Props) {
  const [mounted, setMounted] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  useEffect(() => {
    // Trigger slide-in on next frame
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div
      className={`fixed inset-0 z-30 bg-white overflow-y-auto transition-transform duration-300 ease-out ${
        mounted ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ paddingBottom: '80px' }}
    >
      {/* Cover photo with overlaid claim button */}
      <div className="relative h-64 bg-gray-200 overflow-hidden flex-shrink-0">
        {!photoLoaded && <SkeletonDetail />}

        {cafe.cover_photo_url ? (
          <>
            <img
              src={cafe.cover_photo_url}
              alt={cafe.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${photoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setPhotoLoaded(true)}
              onError={() => setPhotoLoaded(true)}
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-50 to-green-100 flex items-center justify-center text-7xl">
            🍴
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center shadow-md text-gray-700 font-bold text-lg hover:bg-white transition-colors"
        >
          ×
        </button>

        {/* Cafe name overlaid on photo */}
        <div className="absolute bottom-16 left-4 right-4">
          <h1 className="text-white text-xl font-bold drop-shadow-lg">{cafe.name}</h1>
          {cafe.description && (
            <p className="text-white/80 text-sm mt-0.5 drop-shadow">{cafe.description}</p>
          )}
        </div>

        {/* Claim button overlaid at photo bottom */}
        {cafe.bonus_info && (
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <BonusClaimFlow partnerId={cafe.id} cafeSlug={cafe.slug} bonusInfo={cafe.bonus_info} bonusReusable={cafe.bonus_reusable} />
          </div>
        )}
      </div>

      {/* Info list */}
      <div className="px-4 pt-2">
        {/* Hours */}
        {cafe.hours && cafe.hours.length > 0 && (
          <HoursSection hours={cafe.hours} />
        )}

        {/* Phone */}
        {cafe.phone && (
          <div className="flex items-center gap-3 py-4 border-b border-gray-100">
            <span className="text-xl w-7 text-center">📞</span>
            <div className="flex-1">
              <p className="text-sm text-gray-800 font-medium">Phone</p>
              <p className="text-xs text-gray-500">{cafe.phone}</p>
            </div>
            <a
              href={`tel:${cafe.phone}`}
              onClick={() => {}}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            >
              Call
            </a>
          </div>
        )}

        {/* Today's menu */}
        {cafe.daily_menus[0]?.menu_text && (
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl w-7 text-center">🍽️</span>
              <p className="text-sm text-gray-800 font-medium">Today's Menu</p>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-line pl-10 leading-relaxed">
              {cafe.daily_menus[0].menu_text}
            </p>
          </div>
        )}

        {/* Gallery */}
        {cafe.photos && cafe.photos.length > 0 && (
          <div className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl w-7 text-center">📸</span>
              <p className="text-sm text-gray-800 font-medium">Gallery</p>
            </div>
            <ImageGallery photos={cafe.photos} />
          </div>
        )}
      </div>
    </div>
  );
}
