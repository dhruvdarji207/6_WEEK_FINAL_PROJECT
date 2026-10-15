import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { BuyerRequirement, MatchResponse, MatchResultItem } from '../types';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { ScoreBreakdownBar } from '../components/ScoreBreakdownBar';
import { 
  Sparkles, 
  Settings2, 
  AlertOctagon, 
  CheckCircle, 
  MapPin, 
  Info, 
  Send, 
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface Props {
  selectedRequirement: BuyerRequirement | null;
  setActiveTab: (tab: string) => void;
  onInitiateExchange: (listing: any) => void;
}

export const MatchingEnginePage: React.FC<Props> = ({ 
  selectedRequirement, 
  setActiveTab, 
  onInitiateExchange 
}) => {
  const [requirementsList, setRequirementsList] = useState<BuyerRequirement[]>([]);
  const [activeReqId, setActiveReqId] = useState<number | undefined>(selectedRequirement?.id);
  const [mode, setMode] = useState<'rule_based' | 'ml_ranking'>('rule_based');
  const [loading, setLoading] = useState<boolean>(false);
  const [matchResponse, setMatchResponse] = useState<MatchResponse | null>(null);
  const [benchmark, setBenchmark] = useState<any>(null);

  // Load available requirements for the selector dropdown
  useEffect(() => {
    async function loadReqs() {
      try {
        const res = await api.requirements.list({ page_size: 50 });
        setRequirementsList(res.items);
        if (!activeReqId && res.items.length > 0) {
          setActiveReqId(res.items[0].id);
        }
      } catch (err) {
        console.error('Failed to load requirements dropdown', err);
      }
    }
    loadReqs();
  }, []);

  // Sync if prop changed
  useEffect(() => {
    if (selectedRequirement?.id) {
      setActiveReqId(selectedRequirement.id);
    }
  }, [selectedRequirement]);

  // Load ML benchmark
  useEffect(() => {
    async function loadBench() {
      try {
        const bench = await api.matching.getBenchmark();
        setBenchmark(bench);
      } catch (err) {
        // Fallback
      }
    }
    loadBench();
  }, []);

  const runMatching = async (reqId?: number, engineMode?: 'rule_based' | 'ml_ranking') => {
    const idToUse = reqId ?? activeReqId;
    if (!idToUse) return;

    setLoading(true);
    try {
      const res = await api.matching.recommend({
        buyer_requirement_id: idToUse,
        mode: engineMode ?? mode,
      });
      setMatchResponse(res);
    } catch (err) {
      console.error('Matching computation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeReqId) {
      runMatching(activeReqId, mode);
    }
  }, [activeReqId, mode]);

  const activeReqObj = requirementsList.find((r) => r.id === activeReqId);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Matching & Recommendation Engine</h1>
            <DemoDataBadge tooltip="Matches evaluated across synthetic listings & demands." />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Explainable multi-criteria algorithmic matchmaking with transparent sub-score decomposition and safety constraint guardrails.
          </p>
        </div>

        {/* Engine Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setMode('rule_based')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'rule_based'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Rule-Based Baseline</span>
          </button>
          <button
            onClick={() => setMode('ml_ranking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'ml_ranking'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ML Ranker (GradientBoosting)</span>
          </button>
        </div>
      </div>

      {/* Requirement Selector & Quick Criteria Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Target Buyer Requirement:
            </label>
            <div className="relative">
              <select
                value={activeReqId || ''}
                onChange={(e) => setActiveReqId(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {requirementsList.map((req) => (
                  <option key={req.id} value={req.id}>
                    [{req.buyer_need_code || `B${req.id}`}] {req.required_material_category} ({req.buyer_name}) — Cap: ₹{req.max_budget_inr_per_kg}/kg
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Parameters Display */}
          {activeReqObj && (
            <div className="w-full md:w-1/2 grid grid-cols-4 gap-2 bg-slate-850 p-3 rounded-2xl border border-slate-800 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Min Quality</span>
                <span className="font-bold text-emerald-400 font-mono">{activeReqObj.minimum_quality_score}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Max Contam</span>
                <span className="font-bold text-amber-400 font-mono">{activeReqObj.maximum_contamination_pct}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Target Vol</span>
                <span className="font-bold text-white font-mono">{activeReqObj.minimum_quantity_tonnes}-{activeReqObj.maximum_quantity_tonnes} t</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Max Budget</span>
                <span className="font-bold text-teal-400 font-mono">₹{activeReqObj.max_budget_inr_per_kg.toFixed(2)}/kg</span>
              </div>
            </div>
          )}
        </div>

        {/* Methodology notice */}
        <div className="text-[11px] text-slate-400 bg-slate-850/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Matching Criteria Weights:</strong> Category Compatibility (25%), Quality Fit (20%), Contamination Limit (15%), Quantity Window (15%), Budget Fit (15%), Distance Proximity (10%).
            </span>
          </div>
          <span className="text-slate-500 font-mono hidden sm:block">
            {mode === 'rule_based' ? 'Mode: Transparent Multi-Factor' : 'Mode: Hybrid Rule + ML Classifier'}
          </span>
        </div>
      </div>

      {/* Model Benchmark Summary (When ML mode is selected) */}
      {mode === 'ml_ranking' && benchmark?.benchmark && (
        <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-800/40 rounded-2xl p-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Machine Learning Completion Ranker Benchmark (Viva Evaluation)</span>
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono">Trained on 360 Transactions</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-3">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-900/30">
              <span className="text-[10px] text-slate-400 block">Baseline Logistic Reg Acc</span>
              <span className="font-bold text-white text-sm font-mono">
                {(benchmark.benchmark.baseline_logistic_regression?.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-900/30">
              <span className="text-[10px] text-slate-400 block">Baseline ROC-AUC</span>
              <span className="font-bold text-white text-sm font-mono">
                {benchmark.benchmark.baseline_logistic_regression?.roc_auc.toFixed(3)}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-emerald-300 block">Gradient Boosting Ranker Acc</span>
              <span className="font-bold text-emerald-400 text-sm font-mono">
                {(benchmark.benchmark.gradient_boosting_ranker?.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-emerald-300 block">Gradient Boosting ROC-AUC</span>
              <span className="font-bold text-emerald-400 text-sm font-mono">
                {benchmark.benchmark.gradient_boosting_ranker?.roc_auc.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Match Results List */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-sm">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Computing multi-factor matching compatibility...</span>
        </div>
      ) : !matchResponse || matchResponse.matches.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <AlertOctagon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Compatible Matches Found</h3>
          <p className="text-slate-400 text-xs mt-1">All candidate listings failed the mandatory safety or quality constraints.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Evaluated <strong className="text-white">{matchResponse.total_evaluated}</strong> available listings across the network.
            </span>
            <span className="italic text-[11px] text-slate-500">
              {matchResponse.disclaimer}
            </span>
          </div>

          <div className="space-y-4">
            {matchResponse.matches.map((item, idx) => {
              const isCompatible = item.is_compatible;
              const score = item.overall_score;

              return (
                <div
                  key={item.listing.id}
                  className={`bg-slate-900 border rounded-2xl p-6 transition-all shadow-sm ${
                    isCompatible
                      ? score >= 78
                        ? 'border-emerald-500/40 hover:border-emerald-500'
                        : 'border-slate-800 hover:border-slate-700'
                      : 'border-red-900/30 opacity-70 bg-slate-900/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left: Overall Score & Listing Info */}
                    <div className="w-full lg:w-5/12 space-y-3">
                      <div className="flex items-center gap-3">
                        {/* Overall Score Badge */}
                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-center shrink-0 border ${
                          isCompatible
                            ? score >= 78
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                              : 'bg-amber-950 text-amber-400 border-amber-500/40'
                            : 'bg-red-950 text-red-400 border-red-800/40'
                        }`}>
                          <span className="text-xl font-mono leading-none">{score.toFixed(0)}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">/ 100</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase font-mono ${
                              item.recommendation_level === 'High Match'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : item.recommendation_level === 'Moderate Match'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {item.recommendation_level}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              #{idx + 1}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white mt-1 line-clamp-1">
                            {item.listing.material_name}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Supplier: <strong className="text-slate-300">{item.listing.supplier_name}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Listing Key Parameters */}
                      <div className="grid grid-cols-4 gap-2 bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-center text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Available</span>
                          <span className="font-bold text-white font-mono">{item.listing.quantity_tonnes} t</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Quality</span>
                          <span className="font-bold text-emerald-400 font-mono">{item.listing.quality_score_0_100}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Contam</span>
                          <span className="font-bold text-amber-400 font-mono">{item.listing.contamination_est_pct}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Ask Price</span>
                          <span className="font-bold text-white font-mono">₹{item.listing.indicative_price_inr_per_kg.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* City & Transit */}
                      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.listing.city}</span>
                        </span>
                        <span>Estimated Transit: <strong className="text-slate-200 font-mono">{item.sub_scores.distance_km} km</strong></span>
                      </div>

                      {/* Exchange Action */}
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            onInitiateExchange(item.listing);
                            setActiveTab('marketplace');
                          }}
                          disabled={!isCompatible}
                          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition ${
                            isCompatible
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Initiate Exchange Request</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Transparent Explainability Sub-Scores & Text */}
                    <div className="w-full lg:w-7/12 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-6">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Transparent Compatibility Breakdown
                      </h4>

                      {/* Sub-Score Bars */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        <ScoreBreakdownBar 
                          label="Category Compatibility" 
                          score={item.sub_scores.category_compatibility} 
                          weightLabel="25%" 
                        />
                        <ScoreBreakdownBar 
                          label="Quality Specification" 
                          score={item.sub_scores.quality_score} 
                          weightLabel="20%" 
                        />
                        <ScoreBreakdownBar 
                          label="Contamination Margin" 
                          score={item.sub_scores.contamination_score} 
                          weightLabel="15%" 
                        />
                        <ScoreBreakdownBar 
                          label="Quantity Window Fit" 
                          score={item.sub_scores.quantity_fit_score} 
                          weightLabel="15%" 
                        />
                        <ScoreBreakdownBar 
                          label="Budget Alignment" 
                          score={item.sub_scores.budget_fit_score} 
                          weightLabel="15%" 
                        />
                        <ScoreBreakdownBar 
                          label="Geographic Proximity" 
                          score={item.sub_scores.distance_score} 
                          weightLabel="10%" 
                        />
                      </div>

                      {/* Explanatory Narrative Statements */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 block">AI Rationales:</span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {item.explanation.map((exp, eIdx) => (
                            <li key={eIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 mt-0.5">•</span>
                              <span className="leading-snug">{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Failed Constraints (If Any) */}
                      {item.failed_constraints.length > 0 && (
                        <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-red-400">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            <span>Failed Constraints:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-red-200">
                            {item.failed_constraints.map((fc, fIdx) => (
                              <li key={fIdx}>{fc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
