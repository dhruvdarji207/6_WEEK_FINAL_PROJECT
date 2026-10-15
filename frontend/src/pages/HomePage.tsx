import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { 
  Recycle, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Factory, 
  PackageCheck, 
  Compass, 
  Leaf, 
  CheckCircle2, 
  Zap,
  ChevronRight
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const HomePage: React.FC<Props> = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalListings: 180,
    totalRequirements: 140,
    completedExchanges: 360,
    divertedTonnes: 4520,
    co2eAvoidedTonnes: 5890,
  });

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const impact = await api.impact.getSummary();
        const listings = await api.listings.list({ page_size: 1 });
        const reqs = await api.requirements.list({ page_size: 1 });
        
        setStats({
          totalListings: listings.total || 180,
          totalRequirements: reqs.total || 140,
          completedExchanges: impact.total_completed_exchanges || 360,
          divertedTonnes: Math.round(impact.total_diverted_tonnes) || 4520,
          co2eAvoidedTonnes: Math.round(impact.total_avoided_co2e_tonnes) || 5890,
        });
      } catch (err) {
        // Fallback to starter dataset metrics
      }
    }
    fetchLiveStats();
  }, []);

  return (
    <div className="space-y-16 pb-12 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Circular Industrial Symbiosis</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Transform Industrial Waste into <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              High-Value Secondary Raw Materials
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Waste2Worth AI bridges the gap between manufacturing plants generating by-products and recyclers seeking circular feedstocks. Through multi-parameter explainable matching, transparent quality scoring, and LCA carbon accounting, we close industrial material loops.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 text-sm"
            >
              <span>Explore Waste Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('matching')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 text-white font-medium border border-slate-700 hover:bg-slate-750 hover:border-slate-600 transition-all text-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Launch AI Match Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/60 text-slate-300 font-medium border border-slate-800 hover:text-white transition-all text-sm"
            >
              <span>Indicative Price Predictor</span>
            </button>
          </div>

          <div className="pt-2 flex justify-center">
            <DemoDataBadge tooltip="Platform metrics derived from initial synthetic demonstration dataset." />
          </div>
        </div>
      </section>

      {/* Live Demonstration Metrics Counter */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              <span>Catalogued Listings</span>
              <Factory className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono">{stats.totalListings}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>12 Material Streams</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              <span>Buyer Requisitions</span>
              <PackageCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2 font-mono">{stats.totalRequirements}</div>
            <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
              <span>Procurement Windows</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              <span>Waste Diverted</span>
              <Recycle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-300 mt-2 font-mono">{stats.divertedTonnes.toLocaleString()} t</div>
            <div className="text-[11px] text-amber-400/80 mt-1">Avoided Landfill Mass</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-sm">
            <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
              <span>Avoided CO₂e</span>
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-300 mt-2 font-mono">{stats.co2eAvoidedTonnes.toLocaleString()} t</div>
            <div className="text-[11px] text-emerald-400/80 mt-1">Virgin Displacement LCA</div>
          </div>
        </div>
      </section>

      {/* Circular Economy Flow Diagram: Linear Take-Make-Waste vs Waste2Worth Circular Loop */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              From Linear "Take-Make-Waste" to Circular Symbiosis
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              In conventional industrial linear models, manufacturing by-products are treated as cost liabilities and landfilled. Waste2Worth AI orchestrates closed-loop material exchanges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Linear Model */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6 relative">
              <span className="text-xs uppercase tracking-wider font-semibold text-red-400 bg-red-900/30 px-2.5 py-1 rounded-full">
                Traditional Linear System
              </span>
              <div className="mt-6 space-y-4 text-xs text-slate-300">
                <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-red-900/20">
                  <div className="w-8 h-8 rounded-lg bg-red-900/30 text-red-400 flex items-center justify-center font-bold">1</div>
                  <div>
                    <p className="font-semibold text-white">Virgin Extraction</p>
                    <p className="text-slate-400">Mining, petrochemical refining, high-carbon sourcing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-red-900/20">
                  <div className="w-8 h-8 rounded-lg bg-red-900/30 text-red-400 flex items-center justify-center font-bold">2</div>
                  <div>
                    <p className="font-semibold text-white">Manufacturing Scrap Generation</p>
                    <p className="text-slate-400">Offcuts, slag, regrind, cullet discarded</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-red-900/20">
                  <div className="w-8 h-8 rounded-lg bg-red-900/30 text-red-400 flex items-center justify-center font-bold">3</div>
                  <div>
                    <p className="font-semibold text-red-300">Landfill & Open Dumping</p>
                    <p className="text-slate-400">Methane emissions, leachate hazard, wasted material capital</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Waste2Worth Circular Loop */}
            <div className="bg-emerald-950/25 border border-emerald-800/40 rounded-2xl p-6 relative">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-900/40 px-2.5 py-1 rounded-full">
                Waste2Worth AI Circular Symbiosis
              </span>
              <div className="mt-6 space-y-4 text-xs text-slate-300">
                <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-emerald-800/30">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">A</div>
                  <div>
                    <p className="font-semibold text-white">Waste Material Specification</p>
                    <p className="text-slate-400">Supplier logs quantity, quality score & contamination %</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-emerald-800/30">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">B</div>
                  <div>
                    <p className="font-semibold text-white">Algorithmic Compatibility Matching</p>
                    <p className="text-slate-400">Multi-criteria engine scores quality, budget, logistics radius</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-emerald-800/30">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">C</div>
                  <div>
                    <p className="font-semibold text-emerald-300">Secondary Raw Material Reuse</p>
                    <p className="text-slate-400">Direct factory re-entry with transparent LCA CO₂e tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Waste2Worth AI Works (4-Step Visual Flow) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-white">How the Platform Works</h2>
          <p className="text-slate-400 text-sm mt-2">
            End-to-end transparent workflow from material listing to circular delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
            <span className="text-3xl font-black text-slate-800 absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Factory className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">1. Post By-Product</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Industrial suppliers submit waste lots with lab metrics (purity, contamination, condition).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
            <span className="text-3xl font-black text-slate-800 absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">2. AI Matching</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Engine calculates multi-objective compatibility scores, filtering out unsafe lots.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
            <span className="text-3xl font-black text-slate-800 absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">3. Safe Exchange</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Buyers and suppliers agree on terms, schedule logistics, and record delivery milestones.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative">
            <span className="text-3xl font-black text-slate-800 absolute top-4 right-4">04</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Leaf className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-sm">4. Verified Impact</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Diverted tonnes and avoided CO₂ emissions are audited and published to ESG dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* Primary Action Callouts */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => setActiveTab('marketplace')}
            className="group cursor-pointer bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-3xl transition-all shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">For Material Buyers</span>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white">Find Certified Secondary Raw Materials</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Browse 180+ listings across plastics, textiles, aggregates, metals, paper, and biomass with quality and contamination transparency.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span>Search Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('requirements')}
            className="group cursor-pointer bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-teal-500/50 p-6 rounded-3xl transition-all shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">For Industrial Suppliers</span>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-white">Check Active Industry Demand</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Inspect buyer demand requirements with explicit willingness-to-pay budgets and technical specification tolerances.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-teal-400">
              <span>View Buyer Demands</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
