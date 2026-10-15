import React from 'react';

interface Props {
  label: string;
  score: number;
  weightLabel?: string;
  detail?: string;
}

export const ScoreBreakdownBar: React.FC<Props> = ({ label, score, weightLabel, detail }) => {
  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400';
    if (val >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-300">{label}</span>
          {weightLabel && (
            <span className="text-[10px] text-slate-500">({weightLabel})</span>
          )}
        </div>
        <span className={`font-mono font-bold ${getTextColor(score)}`}>
          {score.toFixed(1)}%
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(score)}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {detail && (
        <p className="text-[11px] text-slate-400 italic pt-0.5">{detail}</p>
      )}
    </div>
  );
};
