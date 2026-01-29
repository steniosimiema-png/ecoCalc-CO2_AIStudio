import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { CalculationResult } from '../types';
import { TRANSPORT_ICONS, TREE_OFFSET_FACTOR } from '../constants.tsx';
// Added TrendingDown and Leaf to fix "Cannot find name" errors on lines 79, 164, 168, 172, and 178
import { Award, TreeDeciduous, Info, TrendingDown, Leaf } from 'lucide-react';

interface ResultsDashboardProps {
  result: CalculationResult | null;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
        <div className="bg-slate-200 p-4 rounded-full mb-4">
          <Info size={32} />
        </div>
        <p className="text-center">Calcule uma rota para visualizar o comparativo de emissões e dicas de sustentabilidade.</p>
      </div>
    );
  }

  const bestOption = result.emissions[0];
  const worstOption = result.emissions[result.emissions.length - 1];
  const savings = worstOption.co2kg - bestOption.co2kg;
  const treesNeeded = bestOption.co2kg / TREE_OFFSET_FACTOR;

  const chartData = result.emissions.map(e => ({
    name: e.label,
    co2: parseFloat(e.co2kg.toFixed(2)),
    level: e.level
  }));

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#10b981'; // emerald-500
      case 'medium': return '#f59e0b'; // amber-500
      case 'high': return '#ef4444'; // red-500
      default: return '#94a3b8';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Melhor Opção</p>
            <p className="text-lg font-bold text-slate-800">{bestOption.label}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <TreeDeciduous size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Compensação</p>
            <p className="text-lg font-bold text-slate-800">{(treesNeeded * 12).toFixed(1)} árvores/mês</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Economia Potencial</p>
            <p className="text-lg font-bold text-slate-800">{savings.toFixed(1)} kg CO2</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-800">Emissão de CO2 por Passageiro (kg)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                fontSize={12} 
                tick={{ fill: '#64748b' }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="co2" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getLevelColor(entry.level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {result.emissions.map((e, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-xl border-2 flex flex-col gap-3 transition-transform hover:scale-[1.02] bg-white ${
              e.level === 'low' ? 'border-emerald-100 bg-emerald-50/20' : 
              e.level === 'medium' ? 'border-amber-100 bg-amber-50/20' : 
              'border-red-100 bg-red-50/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${
                e.level === 'low' ? 'bg-emerald-500 text-white' : 
                e.level === 'medium' ? 'bg-amber-500 text-white' : 
                'bg-red-500 text-white'
              }`}>
                {TRANSPORT_ICONS[e.mode]}
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                e.level === 'low' ? 'bg-emerald-100 text-emerald-700' : 
                e.level === 'medium' ? 'bg-amber-100 text-amber-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {e.level === 'low' ? 'Ecológico' : e.level === 'medium' ? 'Moderado' : 'Impactante'}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-bold text-slate-700">{e.label}</p>
              <p className="text-2xl font-black text-slate-900">{e.co2kg.toFixed(2)}<span className="text-xs font-normal text-slate-500 ml-1">kg CO2</span></p>
            </div>

            <div className="mt-auto pt-3 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>{result.distanceKm.toFixed(0)} km</span>
              <span>{i === 0 ? '🏆 Melhor escolha' : ''}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Tips Section */}
      <div className="bg-emerald-900 text-white p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Como reduzir seu impacto?</h3>
          <ul className="space-y-4 text-emerald-100 mt-6">
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-500/20 p-1 rounded-full"><Leaf size={14} className="text-emerald-400" /></div>
              <p>Prefira transporte público ou trens em viagens de média distância. A diferença pode chegar a 90% de economia de CO2.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-500/20 p-1 rounded-full"><Leaf size={14} className="text-emerald-400" /></div>
              <p>Ao usar o carro, compartilhe a carona. Dividir com 3 pessoas reduz seu impacto individual proporcionalmente.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-500/20 p-1 rounded-full"><Leaf size={14} className="text-emerald-400" /></div>
              <p>Para viagens internacionais, considere voos diretos e economize nas emissões de decolagem, a fase mais poluente.</p>
            </li>
          </ul>
        </div>
        <div className="absolute -bottom-12 -right-12 opacity-10">
          <Leaf size={300} strokeWidth={1} />
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;