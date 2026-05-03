import { useEffect, useRef } from 'react';
import type { Organization, Partner } from '../lib/supabase';

type Props = {
  org: Organization;
  partners: Partner[];
  onViewMenus: () => void;
};

const LISBON_DEFAULT: [number, number] = [38.718, -9.142];

export default function MapTab({ org, partners, onViewMenus }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    (window as Window & { __lm_viewMenus?: () => void }).__lm_viewMenus = onViewMenus;

    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default ?? leafletModule;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
        iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
        shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
      });

      const center: [number, number] =
        org.lat != null && org.lng != null ? [org.lat, org.lng] : LISBON_DEFAULT;

      const map = L.map(mapRef.current!).setView(center, 16);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      L.marker(center)
        .bindPopup(`<div class="text-center"><b>${org.name}</b><br/><span style="font-size:11px;color:#6b7280">You are here</span></div>`)
        .addTo(map);

      partners
        .filter((p) => p.lat != null && p.lng != null)
        .forEach((p) => {
          const popup = `
            <div style="text-align:center;min-width:120px">
              <b style="display:block;margin-bottom:4px">${p.name}</b>
              ${p.bonus_info ? `<span style="font-size:11px;color:#16a34a">🎁 ${p.bonus_info}</span><br/>` : ''}
              <button
                onclick="window.__lm_viewMenus && window.__lm_viewMenus()"
                style="margin-top:8px;padding:4px 12px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600"
              >View Offers</button>
            </div>`;
          L.marker([p.lat!, p.lng!]).bindPopup(popup).addTo(map);
        });
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height: 'calc(100vh - 128px)' }} />
    </div>
  );
}
