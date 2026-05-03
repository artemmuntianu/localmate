import { useState } from 'react';
import { createPortal } from 'react-dom';

type Props = { photos: string[] };

function Skeleton() {
  return <div className="animate-pulse bg-gray-200 rounded-xl w-full aspect-video" />;
}

export default function ImageGallery({ photos }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [mainLoaded, setMainLoaded] = useState(false);

  if (!photos.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div>
      {/* Main slider */}
      <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-200 mb-2 cursor-pointer" onClick={() => setLightbox(current)}>
        {!mainLoaded && <Skeleton />}
        <img
          key={current}
          src={photos[current]}
          alt={`Photo ${current + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${mainLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setMainLoaded(true)}
          onError={() => setMainLoaded(true)}
        />

        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-colors"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-2xl transition-colors"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); setMainLoaded(false); }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail grid */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-1.5">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                i === current ? 'border-brand-500' : 'border-transparent'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && createPortal(
        <div
          className="fixed inset-0 bg-black flex items-center justify-center"
          style={{ zIndex: 2147483647 }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl leading-none opacity-80 hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
          >
            ×
          </button>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-16 h-16 flex items-center justify-center text-5xl transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + photos.length) % photos.length); }}
          >
            ‹
          </button>
          <img
            src={photos[lightbox]}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-16 h-16 flex items-center justify-center text-5xl transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % photos.length); }}
          >
            ›
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
