import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AdminStats, AuditLog, WasteListing, User } from '../types';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { Modal } from '../components/Modal';
import { 
  ShieldCheck, 
  Users, 
  Package, 
  Clock, 
  FileText, 
  AlertTriangle, 
  RotateCcw, 
  Check, 
  X, 
  Eye,
  Activity
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingListings, setPendingListings] = useState<WasteListing[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reseedLoading, setReseedLoading] = useState<boolean>(false);

  // Moderation action modal
  const [selectedListing, setSelectedListing] = useState<WasteListing | null>(null);
  const [modAction, setModAction] = useState<'approve' | 'reject'>('approve');
  const [modNotes, setModNotes] = useState('');
  const [modLoading, setModLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, pending, logs, users] = await Promise.all([
        api.admin.getStats(),
        api.admin.getPendingListings(),
        api.admin.getAuditLogs({ limit: 40 }),
        api.admin.getUsers(),
      ]);
      setStats(s);
      setPendingListings(pending);
      setAuditLogs(logs);
      setUsersList(users);
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleModerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    setModLoading(true);
    try {
      await api.admin.moderateListing(selectedListing.id, {
        action: modAction,
        notes: modNotes,
      });
      setSelectedListing(null);
      setModNotes('');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Moderation action failed');
    } finally {
      setModLoading(false);
    }
  };

  const handleReseed = async () => {
    if (!confirm('Re-synchronize database with original synthetic starter pack? This will re-index demo listings and transaction baselines.')) return;
    setReseedLoading(true);
    try {
      await api.admin.reseedDemoData();
      alert('Database reseeded successfully!');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Reseeding failed');
    } finally {
      setReseedLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <ShieldCheck className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Administrator Access Restricted</h2>
        <p className="text-slate-400 text-xs mt-2">
          This portal requires role <code>admin</code>. Please switch to the Demo Administrator account using the top navbar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">System Administration & Regulatory Audit</h1>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-semibold">
              Root Authority Active
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Listing moderation, immutable audit log surveillance, user verification, and demo dataset synchronization.
          </p>
        </div>

        <button
          onClick={handleReseed}
          disabled={reseedLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${reseedLoading ? 'animate-spin' : ''}`} />
          <span>{reseedLoading ? 'Reseeding...' : 'Reseed Starter Datasets'}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Aggregating admin telemetry...</span>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Top Admin Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Pending Moderation</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </span>
              <div className="text-3xl font-extrabold text-amber-400 mt-2 font-mono">{stats.pending_moderation_listings}</div>
              <p className="text-[11px] text-slate-500 mt-1">Requires manual review</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Active Disputes</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </span>
              <div className="text-3xl font-extrabold text-red-400 mt-2 font-mono">{stats.active_disputes}</div>
              <p className="text-[11px] text-slate-500 mt-1">Quality/delivery issues</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Total Organizations</span>
                <Users className="w-4 h-4 text-teal-400" />
              </span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">{stats.total_users}</div>
              <p className="text-[11px] text-slate-500 mt-1">Suppliers & Buyers</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 flex items-center justify-between">
                <span>Audit Logs Recorded</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">{stats.audit_logs_count}</div>
              <p className="text-[11px] text-slate-500 mt-1">Immutable events</p>
            </div>
          </div>

          {/* Section: Pending Listings Moderation Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Waste Listing Moderation Queue ({pendingListings.length})</span>
              </h2>
              <span className="text-xs text-slate-400">Newly submitted materials remain unverified until approved</span>
            </div>

            {pendingListings.length === 0 ? (
              <div className="p-8 text-center bg-slate-850 rounded-2xl border border-slate-800 text-xs text-slate-400">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span>All submitted listings have been reviewed and approved!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-850 p-4 rounded-2xl border border-slate-750 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-white">{item.listing_code || `L${item.id}`}</span>
                        <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono uppercase">
                          {item.material_category}
                        </span>
                        <span className="text-xs text-slate-400">• Supplier: {item.supplier_name}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">{item.material_name}</h4>
                      <div className="text-xs text-slate-400 mt-1 flex gap-4">
                        <span>Volume: <strong className="text-slate-200">{item.quantity_tonnes} t</strong></span>
                        <span>Quality: <strong className="text-emerald-400">{item.quality_score_0_100}%</strong></span>
                        <span>Contam: <strong className="text-amber-400">{item.contamination_est_pct}%</strong></span>
                        <span>Location: <strong className="text-slate-200">{item.city}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedListing(item);
                          setModAction('approve');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Listing</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedListing(item);
                          setModAction('reject');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-red-400 border border-red-900/40 hover:bg-red-950/40 text-xs transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Live Immutable Audit Trail */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Security Audit Log Trail</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">Last 40 events</span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">Entity</th>
                    <th className="py-2.5 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-400">{log.action}</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">{log.user_email || 'System'}</td>
                      <td className="py-2.5 px-4 uppercase text-slate-400">{log.entity_type} #{log.entity_id}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-300 max-w-md truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* Moderation Action Modal */}
      <Modal
        isOpen={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        title={`Review Waste Listing: ${selectedListing?.material_name || ''}`}
      >
        <form onSubmit={handleModerateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Inspection Findings & Verification Notes
            </label>
            <textarea
              rows={3}
              value={modNotes}
              onChange={(e) => setModNotes(e.target.value)}
              placeholder="e.g. Certified lab assay verified; moisture content within acceptable limit."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedListing(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modLoading}
              className={`px-5 py-2 rounded-xl font-semibold transition ${
                modAction === 'approve'
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {modLoading ? 'Logging...' : modAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
