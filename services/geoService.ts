
import { Location, RouteData } from '../types';

/**
 * Nominatim Search API for Autocomplete
 */
export async function searchLocations(query: string): Promise<Location[]> {
  if (query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'EcoCalc-CO2-App/1.0'
        }
      }
    );
    const data = await response.json();
    return data.map((item: any) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

/**
 * OSRM Route API
 */
export async function getRoute(start: Location, end: Location): Promise<RouteData | null> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=polyline`
    );
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes.length) {
      return null;
    }

    return {
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
      geometry: data.routes[0].geometry
    };
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
}
