
export interface Location {
  name: string;
  lat: number;
  lon: number;
}

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: string; // polyline
}

export enum TransportMode {
  CAR_PETROL = 'CAR_PETROL',
  CAR_DIESEL = 'CAR_DIESEL',
  CAR_ELECTRIC = 'CAR_ELECTRIC',
  PLANE = 'PLANE',
  BUS = 'BUS',
  TRAIN = 'TRAIN',
  MOTORCYCLE = 'MOTORCYCLE'
}

export interface EmissionResult {
  mode: TransportMode;
  label: string;
  co2kg: number;
  level: 'low' | 'medium' | 'high';
}

export interface CalculationResult {
  origin: Location;
  destination: Location;
  distanceKm: number;
  durationMin: number;
  passengers: number;
  emissions: EmissionResult[];
  timestamp: number;
}
