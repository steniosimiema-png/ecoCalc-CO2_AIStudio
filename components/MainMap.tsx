
import React, { useEffect, useRef } from 'react';
import { Location } from '../types';

interface MainMapProps {
  origin: Location | null;
  destination: Location | null;
}

const MainMap: React.FC<MainMapProps> = ({ origin, destination }) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    // Lazy load Leaflet
    const L = (window as any).L;
    if (!L || !containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView([-15, -47], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Clear previous
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (polylineRef.current) polylineRef.current.remove();

    const group: any[] = [];

    if (origin) {
      const originMarker = L.marker([origin.lat, origin.lon], {
        title: 'Origem',
        icon: L.divIcon({
          className: 'bg-emerald-600 w-4 h-4 rounded-full border-2 border-white shadow-lg',
          iconSize: [16, 16]
        })
      }).addTo(mapRef.current);
      markersRef.current.push(originMarker);
      group.push([origin.lat, origin.lon]);
    }

    if (destination) {
      const destMarker = L.marker([destination.lat, destination.lon], {
        title: 'Destino',
        icon: L.divIcon({
          className: 'bg-red-600 w-4 h-4 rounded-full border-2 border-white shadow-lg',
          iconSize: [16, 16]
        })
      }).addTo(mapRef.current);
      markersRef.current.push(destMarker);
      group.push([destination.lat, destination.lon]);
    }

    if (origin && destination) {
      // Draw simple line (actual route geometry could be passed here if fetched)
      const line = L.polyline([[origin.lat, origin.lon], [destination.lat, destination.lon]], {
        color: '#10b981',
        weight: 3,
        dashArray: '5, 10'
      }).addTo(mapRef.current);
      polylineRef.current = line;
      mapRef.current.fitBounds(line.getBounds(), { padding: [50, 50] });
    } else if (group.length > 0) {
      mapRef.current.setView(group[0], 12);
    }
  }, [origin, destination]);

  return <div ref={containerRef} className="w-full h-full shadow-inner border border-slate-200" />;
};

export default MainMap;
