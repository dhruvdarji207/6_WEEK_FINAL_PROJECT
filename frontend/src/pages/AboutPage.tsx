import React from 'react';
import { 
  Award, 
  Recycle, 
  CheckCircle, 
  ShieldAlert, 
  Code, 
  HelpCircle, 
  ChevronRight,
  BookOpen,
  Cpu,
  Layers,
  Globe
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const vivaFaqs = [
    {
      q: "1. What is the fundamental problem Waste2Worth AI addresses?",
      a: "Industrial manufacturing plants generate substantial volumes of scrap and by-products that are landfilled as waste liabilities due to information asymmetry, unverified material qualities, and lack of regional matching. Concurrently, recyclers and secondary manufacturers struggle to source reliable secondary raw materials. Waste2Worth AI establishes an intelligent circular exchange marketplace connecting these complementary industries."
    },
    {
      q: "2. How does the AI Matching Engine work?",
      a: "The engine utilizes a multi-objective scoring framework evaluating six core criteria: Category Compatibility (25%), Quality Fit (20%), Contamination Tolerances (15%), Quantity Window (15%), Budget Alignment (15%), and Geographic Distance (10%). It enforces strict safety guardrails (e.g. hazardous material prohibitions and contamination caps) before calculating match scores, and provides transparent explainability for every recommendation."
    },
    {
      q: "3. How does the system handle machine learning versus rule-based matching?",
      a: "The platform provides a dual architecture: an explainable rule-based baseline that guarantees 100% auditable decisions, alongside a trained Gradient Boosting classifier that predicts the probability of exchange completion based on historical transaction attributes. In benchmark evaluations, the Gradient Boosting model achieved 88.9% accuracy and 0.926 ROC-AUC over a Logistic Regression baseline."
    },
    {
      q: "4. How is the Data Sufficiency check implemented for waste quantity forecasting?",
      a: "Time-series forecasting requires longitudinal data. When input historical points are fewer than 6 sequential dated observations, the platform strictly blocks fabricated predictions and returns a structured insufficient_data diagnostic alert, maintaining scientific and engineering integrity."
    },
    {
      q: "5. How are environmental savings and avoided emissions calculated?",
      a: "We implement the ISO 14040 Life Cycle Assessment (LCA) displacement standard. Avoided CO₂e is calculated by multiplying transacted diverted secondary mass by recognized virgin material displacement factors (sourced from UK DEFRA & IPCC guidelines), minus secondary haulage transit emissions calculated via Haversine distance."
    },
    {
      q: "6. Why are synthetic datasets utilized in this project?",
      a: "The starter kit includes 180 listings, 140 buyer requirements, and 360 transaction rows synthesized for development and testing. To maintain ethical AI principles, all records are explicitly tagged with demo_data_flag=True and labeled across the UI to clarify that metrics do not reflect actual corporate trade secrets."
    }
  ];

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <Award className="w-4 h-4" />
          <span>University Final-Year Capstone Project & Viva Voce Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About Waste2Worth AI
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          AI-Powered Industrial Waste Exchange Marketplace enabling closed-loop circular economy symbiosis for sustainable manufacturing.
        </p>
      </div>

      {/* Sustainable Development Goals Mapping */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <span>United Nations Sustainable Development Goals (SDG) Alignment</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-2xl font-black text-amber-400">SDG 12</span>
            <h3 className="font-bold text-white text-sm">Responsible Consumption & Production</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target 12.5: Substantially reduce waste generation through prevention, reduction, recycling and secondary material reuse across manufacturing supply chains.
            </p>
          </div>

          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-2xl font-black text-orange-400">SDG 11</span>
            <h3 className="font-bold text-white text-sm">Sustainable Cities & Communities</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target 11.6: Reduce environmental impact of industrial cities by diverting solid manufacturing waste from municipal landfills and incinerators.
            </p>
          </div>

          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-2xl font-black text-blue-400">SDG 9</span>
            <h3 className="font-bold text-white text-sm">Industry, Innovation & Infrastructure</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target 9.4: Upgrade infrastructure and retrofit industries to make them sustainable, with increased resource-use efficiency and adoption of clean technologies.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-emerald-400" />
          <span>Full-Stack Architecture & Technology Stack</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="space-y-3">
            <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">Frontend Application</h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li><strong>React 18 & TypeScript:</strong> Type-safe component architecture</li>
              <li><strong>Vite:</strong> Ultra-fast bundler with automated build pipeline</li>
              <li><strong>Tailwind CSS:</strong> Custom sustainable industrial color design system</li>
              <li><strong>Recharts:</strong> High-performance SVG visualizer for LCA charts</li>
              <li><strong>Lucide Icons:</strong> Consistent accessibility iconography</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-teal-400 text-sm uppercase tracking-wider">Backend API & Database</h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li><strong>FastAPI (Python 3.13):</strong> High-throughput asynchronous REST API</li>
              <li><strong>SQLAlchemy 2.0 ORM:</strong> Normalized schema with strict constraints</li>
              <li><strong>SQLite / PostgreSQL:</strong> Relational storage with documented migration path</li>
              <li><strong>Pydantic v2:</strong> Robust payload validation and serialization</li>
              <li><strong>PyJWT & Bcrypt:</strong> Role-based access control and salted password security</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Viva Voce Defense & Examiner Q&A Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Viva Voce Defense & Technical Evaluation Guide</span>
          </h2>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
            6 Core Defense Topics
          </span>
        </div>

        <div className="space-y-4">
          {vivaFaqs.map((faq, idx) => (
            <div key={idx} className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <h3 className="font-bold text-white text-sm flex items-start gap-2">
                <span className="text-emerald-400 font-mono">Q{idx + 1}:</span>
                <span>{faq.q.substring(3)}</span>
              </h3>
              <p className="text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations & Future Roadmap */}
      <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Project Limitations & Pilot Transition Roadmap</span>
        </div>
        <p className="leading-relaxed">
          1. <strong>Synthetic Grounding:</strong> All initial records represent simulated data; commercial deployment requires onboarding verified industrial pilots with certified weighbridge receipts.
        </p>
        <p className="leading-relaxed">
          2. <strong>Regulated Materials:</strong> Hazardous waste categories are deliberately restricted on the standard exchange and require specialized regulatory compliance clearance.
        </p>
        <p className="leading-relaxed">
          3. <strong>Laboratory Verification:</strong> Material quality and contamination percentages require physical sample testing (e.g. ASTM / ISO standards) prior to irreversible industrial melting or extrusion.
        </p>
      </div>
    </div>
  );
};
