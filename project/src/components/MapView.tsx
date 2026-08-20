import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Profile } from '@/lib/supabase';
import { roleLabel } from '@/lib/utils';

interface MapItem {
  id: string;
  full_name: string;
  role: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  latitude: number | null;
  longitude: number | null;
}

function makeIcon(color: string, emoji: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:16px;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const icons: Record<string, L.DivIcon> = {
  user: makeIcon('#0ea5e9', '👤'),
  ngo: makeIcon('#f97316', '🤝'),
  hospital: makeIcon('#ef4444', '🏥'),
};

export default function MapView({ items }: { items: MapItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const validItems = items.filter(
      (i) => i.latitude !== null && i.longitude !== null && !isNaN(i.latitude) && !isNaN(i.longitude)
    );

    const markers: L.Marker[] = [];

    validItems.forEach((item) => {
      const marker = L.marker([item.latitude!, item.longitude!], {
        icon: icons[item.role] || icons.user,
      });
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:160px;">
          <div style="font-weight:600;font-size:14px;margin-bottom:2px;">${item.full_name}</div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">${roleLabel(item.role)}${item.city ? ' · ' + item.city : ''}</div>
          ${item.address ? `<div style="font-size:12px;color:#4b5563;margin-bottom:4px;">${item.address}</div>` : ''}
          ${item.phone ? `<div style="font-size:12px;color:#0ea5e9;">${item.phone}</div>` : ''}
        </div>
      `);
      marker.addTo(map);
      markers.push(marker);
    });

    if (markers.length > 0 && validItems.length > 0) {
      const bounds = L.latLngBounds(validItems.map((i) => [i.latitude!, i.longitude!] as [number, number]));
      map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
    }
  }, [items]);

  return <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden z-0" />;
}

export type { MapItem };
