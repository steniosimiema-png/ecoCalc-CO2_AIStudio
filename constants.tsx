
import React from 'react';
import { 
  Car, 
  Plane, 
  Bus, 
  TrainFront, 
  Bike, 
  Zap,
  Droplet
} from 'lucide-react';
import { TransportMode } from './types';

export const EMISSION_FACTORS = {
  [TransportMode.CAR_PETROL]: 120, // g CO2/km
  [TransportMode.CAR_DIESEL]: 110,
  [TransportMode.CAR_ELECTRIC]: 50,
  [TransportMode.PLANE]: 250, // Short haul default
  [TransportMode.BUS]: 50,
  [TransportMode.TRAIN]: 14,
  [TransportMode.MOTORCYCLE]: 100,
};

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
  [TransportMode.CAR_PETROL]: 'Carro (Gasolina)',
  [TransportMode.CAR_DIESEL]: 'Carro (Diesel)',
  [TransportMode.CAR_ELECTRIC]: 'Carro (Elétrico)',
  [TransportMode.PLANE]: 'Avião',
  [TransportMode.BUS]: 'Ônibus',
  [TransportMode.TRAIN]: 'Trem',
  [TransportMode.MOTORCYCLE]: 'Motocicleta',
};

export const TRANSPORT_ICONS: Record<TransportMode, React.ReactNode> = {
  [TransportMode.CAR_PETROL]: <Car className="w-5 h-5" />,
  [TransportMode.CAR_DIESEL]: <Droplet className="w-5 h-5" />,
  [TransportMode.CAR_ELECTRIC]: <Zap className="w-5 h-5" />,
  [TransportMode.PLANE]: <Plane className="w-5 h-5" />,
  [TransportMode.BUS]: <Bus className="w-5 h-5" />,
  [TransportMode.TRAIN]: <TrainFront className="w-5 h-5" />,
  [TransportMode.MOTORCYCLE]: <Bike className="w-5 h-5" />,
};

// 1 tree absorbs ~22kg CO2/year
export const TREE_OFFSET_FACTOR = 22;
