import React from 'react';
import { Database } from 'lucide-react';

interface Props {
  className?: string;
  tooltip?: string;
}

export const DemoDataBadge: React.FC<Props> = ({ className = '', tooltip = 'Record origin: Synthetic Demonstration Dataset' }) => {
  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 shadow-sm ${className}`}
    >
      <Database className="w-3 h-3 text-amber-600" />
      <span>Synthetic Demo Data</span>
    </span>
  );
};
