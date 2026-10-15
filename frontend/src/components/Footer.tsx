import React from 'react';
import { Recycle, ShieldAlert, HeartHandshake, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs mt-16">
      {/* SDG Alignment Section */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 bg-slate-850/60 p-4 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 font-bold text-sm">
              12
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold text-sm">SDG 12: Responsible Consumption</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Directly targets 12.5 to substantially reduce waste through industrial symbiosis, recycling, and secondary raw material reuse.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-850/60 p-4 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20 font-bold text-sm">
              11
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold text-sm">SDG 11: Sustainable Cities</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Supports urban & industrial cluster environmental resilience by diverting manufacturing waste from overflowing municipal landfills.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-850/60 p-4 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 font-bold text-sm">
              09
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold text-sm">SDG 9: Industry & Innovation</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Fosters clean industrial infrastructure through algorithmic matching and AI-driven lifecycle optimization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">Waste2Worth AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Full-Stack AI-Powered Industrial Waste Exchange Marketplace developed for research demonstration, university final-year Viva Voce evaluation, and GitHub publication.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 px-3 py-2 rounded-lg max-w-md">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Academic / Prototype Notice:</strong> Demonstrations use synthetic benchmark datasets. Data points do not reflect certified operational safety claims.
              </span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-xs mb-3">Core Technologies</h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>• FastAPI (Python 3.13) & SQLAlchemy ORM</li>
              <li>• React 18, TypeScript & Vite</li>
              <li>• Tailwind CSS & Recharts</li>
              <li>• Scikit-Learn & RandomForest ML</li>
              <li>• SQLite (PostgreSQL Ready)</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-200 uppercase tracking-wider text-xs mb-3">Viva Voce Modules</h5>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Explainable Multi-Factor Matching</li>
              <li>• Data Sufficiency Quantity Guard</li>
              <li>• Indicative Scrap Pricing Regression</li>
              <li>• Role-Based Workflow & Audit Logs</li>
              <li>• LCA Carbon Avoidance Framework</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 Waste2Worth AI — Open Source Circular Economy Project (MIT License).</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Built for University Evaluation & viva voce defense.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
