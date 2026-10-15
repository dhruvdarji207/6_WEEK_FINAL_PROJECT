import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ExchangeRequest } from '../types';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { Modal } from '../components/Modal';
import { 
  Repeat, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  FileText,
  DollarSign
} from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const ExchangeManagerPage: React.FC<Props> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Action Modals
  const [selectedExchange, setSelectedExchange] = useState<ExchangeRequest | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'transit' | 'complete' | 'dispute' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [finalAgreedQty, setFinalAgreedQty] = useState<number>(0);
  const [finalAgreedPrice, setFinalAgreedPrice] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExchanges = async () => {
    setLoading(true);
    try {
      const res = await api.exchanges.list({ status: statusFilter || undefined });
      setExchanges(res);
    } catch (err) {
      console.error('Failed to load exchanges', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, [statusFilter]);

  const openActionModal = (ex: ExchangeRequest, type: 'accept' | 'reject' | 'transit' | 'complete' | 'dispute') => {
    setSelectedExchange(ex);
    setActionType(type);
    setActionNotes('');
    setFinalAgreedQty(ex.requested_quantity_tonnes);
    setFinalAgreedPrice(ex.offered_price_inr_per_kg);
  };

  const handleExecuteStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExchange || !actionType) return;

    setActionLoading(true);
    try {
      let nextStatus = 'Accepted';
      let payload: any = {};

      if (actionType === 'accept') {
        nextStatus = 'Accepted';
      } else if (actionType === 'reject') {
        nextStatus = 'Rejected';
        payload.rejection_reason = actionNotes || 'Supplier unable to meet requested schedule or volume.';
      } else if (actionType === 'transit') {
        nextStatus = 'In Transit';
      } else if (actionType === 'complete') {
        nextStatus = 'Completed';
        payload.agreed_quantity_tonnes = Number(finalAgreedQty);
        payload.agreed_price_inr_per_kg = Number(finalAgreedPrice);
      } else if (actionType === 'dispute') {
        nextStatus = 'Disputed';
        payload.dispute_details = actionNotes || 'Quality or delivery discrepancy reported.';
      }

      await api.exchanges.updateStatus(selectedExchange.id, {
        status: nextStatus,
        ...payload,
      });

      setSelectedExchange(null);
      setActionType(null);
      fetchExchanges();
    } catch (err: any) {
      alert(err.message || 'Status transition failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Submitted':
        return <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full text-[11px] font-mono">Submitted</span>;
      case 'Accepted':
        return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-mono">Accepted</span>;
      case 'In Transit':
        return <span className="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full text-[11px] font-mono">In Transit</span>;
      case 'Completed':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-mono">Completed</span>;
      case 'Rejected':
        return <span className="bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full text-[11px] font-mono">Rejected</span>;
      case 'Disputed':
        return <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full text-[11px] font-mono">Disputed</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[11px] font-mono">{st}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Exchange Lifecycle Manager</h1>
            <DemoDataBadge tooltip="Lifecycle state machine with real-time audit trail." />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Track material transactions from initial requisition through supplier agreement, transit logistics, and final verified delivery.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted (Pending)</option>
            <option value="Accepted">Accepted (Active)</option>
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Disputed">Disputed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Visual State Flow Pipeline Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-x-auto shadow-sm">
        <div className="flex items-center justify-between min-w-[650px] text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono">1</div>
            <span>Requisition Submitted</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono">2</div>
            <span>Supplier Agreement</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono">3</div>
            <span>Logistics & Transit</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600" />
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono">4</div>
            <span>Verified Reuse & Impact</span>
          </div>
        </div>
      </div>

      {/* Exchanges List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading exchange requests...</span>
        </div>
      ) : exchanges.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <Repeat className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Exchanges Recorded</h3>
          <p className="text-slate-400 text-xs mt-1">Initiate a request from the Marketplace or AI Matcher.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {exchanges.map((ex) => {
            const isSupplier = user?.id === ex.supplier_id || user?.role === 'admin';
            const isBuyer = user?.id === ex.buyer_id || user?.role === 'admin';

            return (
              <div
                key={ex.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Code, Title, Counterparties */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{ex.request_code || `REQ-${ex.id}`}</span>
                      {getStatusBadge(ex.status)}
                      <span className="text-[11px] text-slate-500">
                        {new Date(ex.updated_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {ex.listing?.material_name || 'Industrial Secondary Material'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>Buyer: <strong className="text-slate-200">{ex.buyer?.organization_name || ex.buyer?.full_name || 'Buyer'}</strong></span>
                      <span>Supplier: <strong className="text-slate-200">{ex.supplier?.organization_name || ex.supplier?.full_name || 'Supplier'}</strong></span>
                    </div>

                    {ex.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 max-w-xl">
                        "{ex.notes}"
                      </p>
                    )}
                  </div>

                  {/* Center: Financial & Volume Terms */}
                  <div className="flex items-center gap-4 bg-slate-850 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">Requested Qty</span>
                      <span className="font-bold text-white font-mono">{ex.requested_quantity_tonnes} t</span>
                    </div>
                    <div className="h-6 w-px bg-slate-700" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">Offered Price</span>
                      <span className="font-bold text-emerald-400 font-mono">₹{ex.offered_price_inr_per_kg.toFixed(2)}/kg</span>
                    </div>
                    <div className="h-6 w-px bg-slate-700" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">Gross Lot Value</span>
                      <span className="font-bold text-white font-mono">
                        ₹{Math.round(ex.requested_quantity_tonnes * 1000 * ex.offered_price_inr_per_kg).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Right: State Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Supplier Actions on Submitted */}
                    {isSupplier && (ex.status === 'Submitted' || ex.status === 'Under Review') && (
                      <>
                        <button
                          onClick={() => openActionModal(ex, 'accept')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => openActionModal(ex, 'reject')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-red-400 border border-red-900/30 hover:bg-red-950/40 text-xs transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Transition to In Transit */}
                    {isSupplier && ex.status === 'Accepted' && (
                      <button
                        onClick={() => openActionModal(ex, 'transit')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch / In Transit</span>
                      </button>
                    )}

                    {/* Complete Delivery */}
                    {(isBuyer || isSupplier || user?.role === 'admin') && ex.status === 'In Transit' && (
                      <button
                        onClick={() => openActionModal(ex, 'complete')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Delivery & Complete</span>
                      </button>
                    )}

                    {/* Report Dispute */}
                    {ex.status !== 'Completed' && ex.status !== 'Rejected' && ex.status !== 'Cancelled' && ex.status !== 'Disputed' && (
                      <button
                        onClick={() => openActionModal(ex, 'dispute')}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition"
                        title="Flag Discrepancy / Dispute"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dispute / Rejection Banner */}
                {ex.rejection_reason && (
                  <div className="mt-3 p-2.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 text-xs">
                    <strong>Rejection Reason:</strong> {ex.rejection_reason}
                  </div>
                )}
                {ex.dispute_details && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-300 text-xs">
                    <strong>Dispute Details (Under Admin Review):</strong> {ex.dispute_details}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Dialog Modal */}
      <Modal
        isOpen={Boolean(actionType)}
        onClose={() => { setActionType(null); setSelectedExchange(null); }}
        title={`Exchange Action: ${actionType?.toUpperCase()}`}
      >
        <form onSubmit={handleExecuteStatusUpdate} className="space-y-4 text-xs">
          {actionType === 'complete' && (
            <>
              <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-xl text-emerald-300 space-y-1">
                <p className="font-semibold">Verify Final Delivery Figures:</p>
                <p>This will record an irrevocable completed transaction in the database and audit logs for circular impact calculations.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Final Verified Weight (tonnes)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={finalAgreedQty}
                    onChange={(e) => setFinalAgreedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Agreed Settlement Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={finalAgreedPrice}
                    onChange={(e) => setFinalAgreedPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {(actionType === 'reject' || actionType === 'dispute') && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                {actionType === 'reject' ? 'Rejection Reason' : 'Dispute Description & Discrepancy Evidence'}
              </label>
              <textarea
                rows={3}
                required
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Describe contamination variance, moisture discrepancy, or logistics failure..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white resize-none"
              />
            </div>
          )}

          {actionType === 'accept' && (
            <p className="text-slate-300">
              Confirm acceptance of this exchange request. Both parties will be committed to coordinate packaging and freight arrangements.
            </p>
          )}

          {actionType === 'transit' && (
            <p className="text-slate-300">
              Confirm that this waste shipment has cleared weighbridge inspection and is dispatched in transit to the buyer facility.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setActionType(null); setSelectedExchange(null); }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Confirm Status Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
