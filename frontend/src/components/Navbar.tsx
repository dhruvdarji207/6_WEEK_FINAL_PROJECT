import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Recycle, 
  Sparkles, 
  Layers, 
  ShoppingCart, 
  BarChart3, 
  ShieldCheck, 
  Info, 
  LogOut, 
  UserCircle, 
  Globe, 
  ChevronDown,
  Repeat
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { user, logout, demoLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const navItems = [
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
    { id: 'requirements', label: 'Buyer Demands', icon: Layers },
    { id: 'matching', label: 'AI Matcher', icon: Sparkles },
    { id: 'exchanges', label: 'Exchanges', icon: Repeat },
    { id: 'analytics', label: 'ML Analytics', icon: BarChart3 },
    { id: 'impact', label: 'Eco Impact', icon: Globe },
    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldCheck }] : []),
    { id: 'about', label: 'About & Viva', icon: Info },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Banner Notice */}
      <div className="bg-emerald-950/80 border-b border-emerald-800/40 px-4 py-1 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
        <span className="font-semibold text-emerald-200">SDG 12 & SDG 11 Aligned:</span>
        <span>Industrial Secondary Raw Materials Circular Economy Platform</span>
        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded text-[11px]">
          Synthetic Dataset Active
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">Waste2Worth</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-semibold">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">Circular Industrial Marketplace</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side: Auth / User / Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher for Examiners */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:border-slate-600 transition-colors"
                title="Quick Role Switcher for Evaluation"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Demo Roles</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleSwitcherOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-850 border border-slate-700 shadow-xl py-2 z-50 text-xs"
                  onClick={() => setRoleSwitcherOpen(false)}
                >
                  <div className="px-3 py-1 text-slate-400 font-semibold border-b border-slate-750 uppercase tracking-wider text-[10px]">
                    Switch Viva Demo Role
                  </div>
                  <button
                    onClick={() => demoLogin('admin')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between"
                  >
                    <span>🛡️ Administrator</span>
                    <span className="text-[10px] text-slate-500">Audit & Mod</span>
                  </button>
                  <button
                    onClick={() => demoLogin('supplier')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between"
                  >
                    <span>🏭 Waste Supplier</span>
                    <span className="text-[10px] text-slate-500">Post Scrap</span>
                  </button>
                  <button
                    onClick={() => demoLogin('buyer')}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 flex items-center justify-between"
                  >
                    <span>🔬 Material Buyer</span>
                    <span className="text-[10px] text-slate-500">Match & Procure</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 text-xs hover:bg-slate-800 transition"
                >
                  <UserCircle className="w-4 h-4 text-emerald-400" />
                  <div className="text-left hidden sm:block">
                    <p className="font-semibold text-white truncate max-w-[120px]">{user.full_name}</p>
                    <p className="text-[10px] uppercase text-emerald-400 font-mono tracking-wider">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-850 border border-slate-700 shadow-xl py-2 z-50 text-xs"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-750">
                      <p className="font-medium text-white">{user.full_name}</p>
                      <p className="text-slate-400 truncate">{user.email}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{user.organization_name}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-500/20"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Row */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-800 bg-slate-900/90 gap-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap ${
                isActive ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
