import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
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
  const markersRef = useRef<unknown[]>([]);

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

      // Add scale control
      L.control.scale({ imperial: false, metric: true }).addTo(map);

      // Add locate user button
      const locateButton = L.control({ position: 'topleft' });
      locateButton.onAdd = () => {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const link = L.DomUtil.create('a', '', div);
        link.href = '#';
        link.innerHTML = '📍';
        link.title = 'Find my location';
        link.style.cssText = 'display:flex;align-items:center;justify-content:center;width:36px;height:36px;font-size:20px;cursor:pointer;';
        
        L.DomEvent.on(link, 'click', (e) => {
          L.DomEvent.preventDefault(e);
          map.setView(center, 16);
        });

        return div;
      };
      locateButton.addTo(map);

      // Call invalidateSize after a small delay to ensure DOM is ready
      map.invalidateSize();

      L.marker(center)
        .bindPopup(`<div class="text-center"><b>${org.name}</b><br/><span style="font-size:11px;color:#6b7280">You are here</span></div>`)
        .on('click', () => map.setView(center, 16))
        .addTo(map);

      markersRef.current = partners
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => {
          const popup = `
            <div style="text-align:center;min-width:120px">
              <b style="display:block;margin-bottom:4px">${p.name}</b>
              ${p.bonus_info ? `<span style="font-size:11px;color:#16a34a">🎁 ${p.bonus_info}</span><br/>` : ''}
              <button
                onclick="window.__lm_viewMenus && window.__lm_viewMenus()"
                style="margin-top:8px;padding:4px 12px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600"
              >View Offers</button>
            </div>`;
          return L.marker([p.lat!, p.lng!]).bindPopup(popup).addTo(map);
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

  // Update markers when partners change, without recreating the map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default ?? leafletModule;
      const map = mapInstanceRef.current as any;

      // Remove old markers
      markersRef.current.forEach((marker: any) => map.removeLayer(marker));

      // Add new markers
      markersRef.current = partners
        .filter((p) => p.lat != null && p.lng != null)
        .map((p) => {
          const popup = `
            <div style="text-align:center;min-width:120px">
              <b style="display:block;margin-bottom:4px">${p.name}</b>
              ${p.bonus_info ? `<span style="font-size:11px;color:#16a34a">🎁 ${p.bonus_info}</span><br/>` : ''}
              <button
                onclick="window.__lm_viewMenus && window.__lm_viewMenus()"
                style="margin-top:8px;padding:4px 12px;background:#16a34a;color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer;font-weight:600"
              >View Offers</button>
            </div>`;
          return L.marker([p.lat!, p.lng!]).bindPopup(popup).addTo(map);
        });
    });
  }, [partners]);

  return (
    <div className="relative w-full overflow-hidden flex" style={{ height: 'calc(100vh - 120px)' }}>
      <div ref={mapRef} className="flex-1 w-full h-full" style={{ zIndex: 1 }} />
      {/* Map info overlay */}
      <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-xs text-gray-700 pointer-events-none z-50">
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-semibold">●</span>
          <span>{partners.length} partners nearby</span>
        </div>
      </div>
    </div>
  );
}
