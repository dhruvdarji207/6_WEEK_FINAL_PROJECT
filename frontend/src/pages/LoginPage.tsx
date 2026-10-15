import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Factory, ShoppingCart, Lock, Mail, Building, User, MapPin, AlertCircle } from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
}

export const LoginPage: React.FC<Props> = ({ setActiveTab }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState<'supplier' | 'buyer'>('buyer');
  const [city, setCity] = useState('Ahmedabad');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          organization_name: orgName,
          role,
          city,
        });
      } else {
        await login(email, password);
      }
      setActiveTab('marketplace');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoRole: 'admin' | 'supplier' | 'buyer') => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(demoRole);
      setActiveTab(demoRole === 'admin' ? 'admin' : 'marketplace');
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fadeIn">
      {/* Quick Demo Logins Box */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Evaluation / Viva Voce Quick Login
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">1-Click</span>
        </div>
        <p className="text-slate-400 text-xs mb-4">
          Pre-configured test personas with complete role-based permissions:
        </p>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoClick('admin')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 transition group"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-[11px] font-semibold">Admin</span>
            <span className="text-[9px] text-slate-500">Moderator</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoClick('supplier')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 transition group"
          >
            <Factory className="w-5 h-5 text-teal-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-[11px] font-semibold">Supplier</span>
            <span className="text-[9px] text-slate-500">Sell Scrap</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoClick('buyer')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 transition group"
          >
            <ShoppingCart className="w-5 h-5 text-cyan-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-[11px] font-semibold">Buyer</span>
            <span className="text-[9px] text-slate-500">Procure</span>
          </button>
        </div>
      </div>

      {/* Main Login / Register Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 text-center pb-2 text-sm font-semibold transition ${
              !isRegister ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 text-center pb-2 text-sm font-semibold transition ${
              isRegister ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Organization
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company / Facility Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Apex Polymers Pvt Ltd"
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="buyer">Material Buyer</option>
                    <option value="supplier">Waste Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Surat"
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
