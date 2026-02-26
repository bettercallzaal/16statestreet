'use client';

import { Map, List, Table, CalendarDays } from 'lucide-react';
import { ViewMode } from '@/lib/types';
import { HAS_MAPBOX } from '@/lib/constants';
import { trackViewChange } from '@/lib/analytics';
import clsx from 'clsx';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const allViews: { mode: ViewMode; icon: typeof Map; label: string }[] = [
  { mode: 'map', icon: Map, label: 'Map' },
  { mode: 'list', icon: List, label: 'List' },
  { mode: 'calendar', icon: CalendarDays, label: 'Calendar' },
  { mode: 'table', icon: Table, label: 'Table' },
];

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  // Hide map option when no Mapbox token
  const views = HAS_MAPBOX ? allViews : allViews.filter((v) => v.mode !== 'map');

  return (
    <div className="flex rounded-lg border border-slate-700 overflow-hidden">
      {views.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => { trackViewChange(mode); onViewChange(mode); }}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
            viewMode === mode
              ? 'bg-rose-500 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          )}
          aria-label={`${label} view`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
