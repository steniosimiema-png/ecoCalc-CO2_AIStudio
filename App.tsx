
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Leaf, 
  MapPin, 
  Navigation, 
  Users, 
  History, 
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { Location, CalculationResult, TransportMode, EmissionResult } from './types';
import { EMISSION_FACTORS, TRANSPORT_LABELS, TREE_OFFSET_FACTOR } from './constants';
import { searchLocations, getRoute } from './services/geoService';
import MainMap from './components/MainMap';
import ResultsDashboard from './components/ResultsDashboard';

const App: React.FC = () => {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<Location[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Location[]>([]);
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('eco_calc_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (result: CalculationResult) => {
    const newHistory = [result, ...history.slice(0, 9)];
    setHistory(newHistory);
    localStorage.setItem('eco_calc_history', JSON.stringify(newHistory));
  };

  const handleSearchOrigin = async (query: string) => {
    setOriginQuery(query);
    if (query.length > 2) {
      const results = await searchLocations(query);
      setOriginSuggestions(results);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleSearchDest = async (query: string) => {
    setDestQuery(query);
    if (query.length > 2) {
      const results = await searchLocations(query);
      setDestSuggestions(results);
    } else {
      setDestSuggestions([]);
    }
  };

  const calculateEmissions = async () => {
    if (!origin || !destination) {
      setError("Por favor, selecione origem e destino válidos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const route = await getRoute(origin, destination);
      if (!route) {
        throw new Error("Não foi possível calcular a rota terrestre.");
      }

      const distanceKm = route.distance / 1000;
      const durationMin = route.duration / 60;

      const emissions: EmissionResult[] = Object.values(TransportMode).map(mode => {
        let factor = EMISSION_FACTORS[mode];
        
        // Adjust plane based on distance (Short vs Long haul)
        if (mode === TransportMode.PLANE && distanceKm > 500) {
          factor = 150; // Long haul is usually more efficient per km
        }

        let totalCo2 = (distanceKm * factor) / 1000; // in kg

        // Adjust for passengers in shared vehicles
        if ([TransportMode.CAR_PETROL, TransportMode.CAR_DIESEL, TransportMode.CAR_ELECTRIC, TransportMode.MOTORCYCLE].includes(mode)) {
          totalCo2 = totalCo2 / Math.max(1, passengers);
        }

        let level: 'low' | 'medium' | 'high' = 'high';
        if (totalCo2 < 5) level = 'low';
        else if (totalCo2 < 20) level = 'medium';

        return {
          mode,
          label: TRANSPORT_LABELS[mode],
          co2kg: totalCo2,
          level
        };
      }).sort((a, b) => a.co2kg - b.co2kg);

      const result: CalculationResult = {
        origin,
        destination,
        distanceKm,
        durationMin,
        passengers,
        emissions,
        timestamp: Date.now()
      };

      setCurrentResult(result);
      saveToHistory(result);
    } catch (err: any) {
      setError("Erro ao calcular rota. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-emerald-600 text-white p-4 shadow-lg sticky top-0 z-[1000]">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="fill-emerald-200" />
            <h1 className="text-xl font-bold tracking-tight">EcoCalc CO2</h1>
          </div>
          <div className="hidden md:flex gap-4 text-sm font-medium">
            <span className="flex items-center gap-1 opacity-90"><Info size={14} /> Compare emissões</span>
            <span className="flex items-center gap-1 opacity-90"><TrendingDown size={14} /> Viaje sustentável</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden lg:h-[calc(100vh-4rem)]">
        
        {/* Left Sidebar: Controls & History */}
        <aside className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-1">
          <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Navigation className="text-emerald-600" size={20} />
              Planejar Viagem
            </h2>
            
            <div className="space-y-4">
              {/* Origin */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Origem</label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 ring-emerald-500 transition-all bg-slate-50">
                  <MapPin className="ml-3 text-slate-400" size={18} />
                  <input 
                    type="text"
                    className="w-full p-3 bg-transparent outline-none text-sm"
                    placeholder="Cidade de partida..."
                    value={originQuery}
                    onChange={(e) => handleSearchOrigin(e.target.value)}
                  />
                </div>
                {originSuggestions.length > 0 && (
                  <ul className="absolute z-[2000] w-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {originSuggestions.map((loc, idx) => (
                      <li 
                        key={idx}
                        className="p-3 text-sm hover:bg-emerald-50 cursor-pointer border-b last:border-0"
                        onClick={() => {
                          setOrigin(loc);
                          setOriginQuery(loc.name);
                          setOriginSuggestions([]);
                        }}
                      >
                        {loc.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Destino</label>
                <div className="flex items-center border rounded-lg focus-within:ring-2 ring-emerald-500 transition-all bg-slate-50">
                  <MapPin className="ml-3 text-slate-400" size={18} />
                  <input 
                    type="text"
                    className="w-full p-3 bg-transparent outline-none text-sm"
                    placeholder="Cidade de destino..."
                    value={destQuery}
                    onChange={(e) => handleSearchDest(e.target.value)}
                  />
                </div>
                {destSuggestions.length > 0 && (
                  <ul className="absolute z-[2000] w-full mt-1 bg-white border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {destSuggestions.map((loc, idx) => (
                      <li 
                        key={idx}
                        className="p-3 text-sm hover:bg-emerald-50 cursor-pointer border-b last:border-0"
                        onClick={() => {
                          setDestination(loc);
                          setDestQuery(loc.name);
                          setDestSuggestions([]);
                        }}
                      >
                        {loc.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Passengers */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Passageiros (Carro/Moto)</label>
                <div className="flex items-center border rounded-lg bg-slate-50 p-1">
                  <Users className="ml-2 text-slate-400" size={18} />
                  <input 
                    type="number"
                    min="1"
                    max="8"
                    className="w-full p-2 bg-transparent outline-none text-sm"
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                disabled={loading || !origin || !destination}
                onClick={calculateEmissions}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "🔍 Calcular Emissões"}
              </button>
            </div>
          </section>

          {/* History */}
          <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 shrink-0">
              <History className="text-slate-500" size={20} />
              Histórico Recente
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4">Nenhuma viagem calculada.</p>
              ) : (
                history.map((h, i) => (
                  <div 
                    key={i} 
                    className="p-3 border rounded-lg bg-slate-50 hover:bg-white transition-colors group cursor-pointer"
                    onClick={() => {
                      setOrigin(h.origin);
                      setDestination(h.destination);
                      setOriginQuery(h.origin.name);
                      setDestQuery(h.destination.name);
                      setPassengers(h.passengers);
                      setCurrentResult(h);
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{h.distanceKm.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate">{h.origin.name.split(',')[0]}</span>
                        <ArrowRight size={12} className="text-slate-300" />
                        <span className="text-sm font-semibold truncate">{h.destination.name.split(',')[0]}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600">
                          {h.emissions[0].co2kg.toFixed(1)}kg CO2
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>

        {/* Main Area: Map and Dashboard */}
        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="h-2/5 md:h-1/2 min-h-[300px] shrink-0">
            <MainMap origin={origin} destination={destination} />
          </div>
          
          <div className="flex-1 overflow-y-auto pb-6">
            <ResultsDashboard result={currentResult} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
