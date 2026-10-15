import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BuyerRequirement } from '../types';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { Modal } from '../components/Modal';
import { 
  Layers, 
  Plus, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  DollarSign,
  Scale
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
  onSelectRequirementForMatch: (req: BuyerRequirement) => void;
}

export const BuyerRequirementsPage: React.FC<Props> = ({ setActiveTab, onSelectRequirementForMatch }) => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Requirement Form
  const [category, setCategory] = useState('cotton');
  const [prefName, setPrefName] = useState('Textile cotton scraps');
  const [sector, setSector] = useState('Textile');
  const [minQuality, setMinQuality] = useState(70);
  const [maxContam, setMaxContam] = useState(10);
  const [minQty, setMinQty] = useState(5);
  const [maxQty, setMaxQty] = useState(30);
  const [maxBudget, setMaxBudget] = useState(1.2);
  const [city, setCity] = useState('Surat');
  const [condition, setCondition] = useState('clean_dry');

  const categories = [
    'cotton', 'polyester', 'PET', 'HDPE', 'paper_fiber', 
    'wood_fiber', 'biomass', 'organic_biomass', 
    'mineral_aggregate', 'ferrous_metal', 'aluminium', 'glass'
  ];

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await api.requirements.list({ page, page_size: 12 });
      setRequirements(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch buyer requirements', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.requirements.create({
        required_material_category: category,
        preferred_material_name: prefName,
        buyer_sector: sector,
        minimum_quality_score: Number(minQuality),
        maximum_contamination_pct: Number(maxContam),
        minimum_quantity_tonnes: Number(minQty),
        maximum_quantity_tonnes: Number(maxQty),
        max_budget_inr_per_kg: Number(maxBudget),
        city,
        required_condition: condition,
      });
      setIsCreateOpen(false);
      fetchRequirements();
    } catch (err: any) {
      alert(err.message || 'Failed to create requirement');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to cancel and remove this procurement requirement?')) return;
    try {
      await api.requirements.delete(id);
      fetchRequirements();
    } catch (err: any) {
      alert(err.message || 'Failed to delete requirement');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Buyer Procurement Requirements</h1>
            <DemoDataBadge tooltip="140 synthetic buyer requirement demand rows active." />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Raw material specifications logged by recyclers and manufacturers seeking circular feedstocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'buyer' || user?.role === 'admin') && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Requirement</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Requirements */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading buyer demands...</span>
        </div>
      ) : requirements.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Active Buyer Requirements</h3>
          <p className="text-slate-400 text-xs mt-1">Submit your first industrial material requirement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requirements.map((req) => {
            const isOwner = user?.id === req.buyer_id || user?.role === 'admin';

            return (
              <div
                key={req.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-slate-950/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-teal-500/20 font-mono uppercase">
                      {req.required_material_category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {req.city}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {req.preferred_material_name || req.required_material_category}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Buyer: <strong className="text-slate-300">{req.buyer_name}</strong> ({req.buyer_sector})
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-850 p-3 rounded-xl border border-slate-800 text-center text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Target Vol</p>
                      <p className="font-bold text-white font-mono">{req.minimum_quantity_tonnes}-{req.maximum_quantity_tonnes} t</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Min Quality</p>
                      <p className="font-bold text-emerald-400 font-mono">{req.minimum_quality_score}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Max Contam</p>
                      <p className="font-bold text-amber-400 font-mono">{req.maximum_contamination_pct}%</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Condition: <strong className="text-slate-200">{req.required_condition}</strong></span>
                    <span>Budget Cap: <strong className="text-white font-mono">₹{req.max_budget_inr_per_kg.toFixed(2)}/kg</strong></span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {req.buyer_need_code || `B${req.id}`}
                  </span>

                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Delete Requirement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSelectRequirementForMatch(req);
                        setActiveTab('matching');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold text-xs hover:opacity-90 transition shadow-sm shadow-emerald-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Find AI Matches</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6 text-xs text-slate-400">
        <div>
          Showing page <span className="font-semibold text-white">{page}</span> of{' '}
          <span className="font-semibold text-white">{Math.ceil(total / 12) || 1}</span> ({total} total requirements)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => (p * 12 < total ? p + 1 : p))}
            disabled={page * 12 >= total}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Material Procurement Requirement">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Preferred Material Name</label>
            <input
              type="text"
              required
              value={prefName}
              onChange={(e) => setPrefName(e.target.value)}
              placeholder="e.g. Clean Shredded HDPE Bottles"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Required Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Buyer Industry Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Plastics">Plastics & Polymers</option>
                <option value="Manufacturing">General Manufacturing</option>
                <option value="Textile">Textile Processing</option>
                <option value="Construction">Construction Materials</option>
                <option value="Agriculture">Bio-Agriculture</option>
                <option value="Chemical">Chemical Intermediates</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Min Batch (tonnes)</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                required
                value={minQty}
                onChange={(e) => setMinQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Max Batch (tonnes)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={maxQty}
                onChange={(e) => setMaxQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Min Quality (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={minQuality}
                onChange={(e) => setMinQuality(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Max Contam %</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="50"
                required
                value={maxContam}
                onChange={(e) => setMaxContam(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Max Budget (₹/kg)</label>
              <input
                type="number"
                step="0.05"
                min="0.05"
                required
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">City Location</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Required Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="clean_dry">Clean & Dry</option>
                <option value="sorted_clean">Sorted Clean</option>
                <option value="dry_clean">Dry Clean</option>
                <option value="fresh_segregated">Fresh Segregated</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
            >
              Publish Requirement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
