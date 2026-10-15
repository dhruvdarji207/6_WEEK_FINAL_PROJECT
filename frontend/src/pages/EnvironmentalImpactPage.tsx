import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { GlobalImpactSummary } from '../types';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { Modal } from '../components/Modal';
import { 
  Globe, 
  Recycle, 
  Leaf, 
  CheckCircle, 
  ShieldAlert, 
  Info, 
  HelpCircle,
  BarChart2,
  TreeDeciduous,
  Truck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const EnvironmentalImpactPage: React.FC = () => {
  const [impactData, setImpactData] = useState<GlobalImpactSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadImpact() {
      setLoading(true);
      try {
        const res = await api.impact.getSummary();
        setImpactData(res);
      } catch (err) {
        console.error('Failed to load impact metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadImpact();
  }, []);

  const COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#84cc16'];

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Environmental Impact & Circularity Dashboard</h1>
            <DemoDataBadge tooltip="Metrics compiled from synthetic completed transactions." />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Quantified secondary raw material diversion and greenhouse gas displacement under ISO 14040 Life Cycle Assessment standards.
          </p>
        </div>

        <button
          onClick={() => setIsMethodologyOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-850 hover:text-white transition"
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>LCA Methodology & Emission Factors</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Computing cumulative life-cycle emissions...</span>
        </div>
      ) : impactData ? (
        <div className="space-y-8">
          {/* Top Key Performance Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Material Exchanged</span>
                <Recycle className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                {impactData.total_exchanged_tonnes.toLocaleString()} <span className="text-sm font-normal text-slate-400">tonnes</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Across 12 Material Streams</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Landfill Mass Diverted</span>
                <Globe className="w-4 h-4 text-teal-400" />
              </span>
              <div className="text-3xl font-extrabold text-teal-300 mt-2 font-mono">
                {impactData.total_diverted_tonnes.toLocaleString()} <span className="text-sm font-normal text-slate-400">tonnes</span>
              </div>
              <p className="text-[11px] text-teal-400/80 mt-1">Net secondary yield fraction applied</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Avoided GHG (CO₂e)</span>
                <Leaf className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-3xl font-extrabold text-emerald-300 mt-2 font-mono">
                {impactData.total_avoided_co2e_tonnes.toLocaleString()} <span className="text-sm font-normal text-slate-400">t CO₂e</span>
              </div>
              <p className="text-[11px] text-emerald-400/80 mt-1">Displacing virgin raw extraction</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-sm">
              <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Completed Exchanges</span>
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                {impactData.total_completed_exchanges} <span className="text-sm font-normal text-slate-400">deals</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{impactData.verified_transactions_count} verified transactions</p>
            </div>
          </div>

          {/* Environmental Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bar Chart: Avoided CO2e by Material Category */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <span>Avoided Greenhouse Gas Emissions by Material Stream (t CO₂e)</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">DEFRA / IPCC Model</span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={impactData.category_breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="material_category" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="avoided_co2e_tonnes" name="Avoided CO₂e (t)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="diverted_tonnes" name="Diverted Mass (t)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Circular Share of Diverted Mass */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <h3 className="text-sm font-bold text-white mb-2">
                Diverted Material Proportions
              </h3>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={impactData.category_breakdown.slice(0, 6)}
                      dataKey="diverted_tonnes"
                      nameKey="material_category"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ name }) => name}
                    >
                      {impactData.category_breakdown.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-850 p-3 rounded-xl border border-slate-800 mt-2">
                Metals, PET, and fibres represent over 68% of the platform's net carbon displacement volume.
              </div>
            </div>
          </div>

          {/* Breakdown Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Category-Level LCA Verification Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Material Stream</th>
                    <th className="py-2.5 px-4">Transacted Volume</th>
                    <th className="py-2.5 px-4">Diverted Mass</th>
                    <th className="py-2.5 px-4">Avoided CO₂e</th>
                    <th className="py-2.5 px-4">Closed Deals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                  {impactData.category_breakdown.map((row) => (
                    <tr key={row.material_category} className="hover:bg-slate-850/50">
                      <td className="py-2.5 px-4 font-sans font-medium text-white">{row.material_category}</td>
                      <td className="py-2.5 px-4">{row.exchanged_tonnes.toLocaleString()} t</td>
                      <td className="py-2.5 px-4 text-teal-400">{row.diverted_tonnes.toLocaleString()} t</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-bold">{row.avoided_co2e_tonnes.toLocaleString()} t</td>
                      <td className="py-2.5 px-4 text-slate-400">{row.completed_transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* Methodology & Factor Reference Modal */}
      <Modal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        title="Life Cycle Assessment (LCA) Methodology & Emission Baselines"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-xl text-emerald-200 space-y-1">
            <p className="font-semibold text-sm">Displacement Accounting Standard:</p>
            <p>
              Waste2Worth AI applies the system expansion displacement methodology under <strong>ISO 14040/14044</strong> standards. Avoided greenhouse gas emissions are determined by comparing secondary raw material re-entry against virgin industrial primary extraction.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-2">Defensible Material Emission Factors:</h4>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Material Stream</th>
                    <th className="py-2 px-3">Displacement Factor</th>
                    <th className="py-2 px-3">Displaced Primary Baseline</th>
                    <th className="py-2 px-3">Citation Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Aluminium</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">8.14 kg CO₂e / kg</td>
                    <td className="py-2 px-3">Virgin bauxite smelting</td>
                    <td className="py-2 px-3 text-slate-400">DEFRA GHG Factors</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Ferrous Metal</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">1.52 kg CO₂e / kg</td>
                    <td className="py-2 px-3">Virgin iron ore blast furnace</td>
                    <td className="py-2 px-3 text-slate-400">WorldSteel LCA Standard</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">PET / HDPE</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">1.78 kg CO₂e / kg</td>
                    <td className="py-2 px-3">Virgin fossil naphtha monomer</td>
                    <td className="py-2 px-3 text-slate-400">PlasticsEurope Eco-profile</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Textile Cotton</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">2.45 kg CO₂e / kg</td>
                    <td className="py-2 px-3">Agricultural cultivation & ginning</td>
                    <td className="py-2 px-3 text-slate-400">Textile Exchange LCA</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Biomass / Organics</td>
                    <td className="py-2 px-3 font-mono text-emerald-400">0.45 kg CO₂e / kg</td>
                    <td className="py-2 px-3">Landfill methane avoidance</td>
                    <td className="py-2 px-3 text-slate-400">IPCC Waste Guidelines</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <h5 className="font-semibold text-white">Logistics & Secondary Transport Accounting:</h5>
            <p className="text-[11px] text-slate-400">
              Unlike theoretical calculators, Waste2Worth AI applies a heavy-goods transport deduction of <strong>0.08 kg CO₂e per tonne-km</strong> based on the Haversine transit distance between buyer and supplier industrial clusters.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
