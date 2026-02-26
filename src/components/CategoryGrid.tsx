'use client';

import { useMemo } from 'react';
import { Palette, Hammer, Store, Users, Music, Scissors, Film, Heart } from 'lucide-react';
import type { ETHDenverEvent } from '@/lib/types';

interface CategoryGridProps {
  events: ETHDenverEvent[];
  activeCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const CATEGORIES = [
  { name: 'Workshop', icon: Hammer, color: '#34D399' },
  { name: 'Open Studio', icon: Palette, color: '#34D399' },
  { name: 'Arts', icon: Heart, color: '#FBBF24' },
  { name: 'Market', icon: Store, color: '#34D399' },
  { name: 'Meetup', icon: Users, color: '#3B82F6' },
  { name: 'Music', icon: Music, color: '#FBBF24' },
  { name: 'Makerspace', icon: Scissors, color: '#3B82F6' },
  { name: 'Film', icon: Film, color: '#34D399' },
];

export function CategoryGrid({ events, activeCategory, onCategorySelect }: CategoryGridProps) {
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of events) {
      for (const tag of event.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return counts;
  }, [events]);

  // Only show categories that have events
  const visibleCategories = CATEGORIES.filter((c) => (categoryCounts.get(c.name) ?? 0) > 0);

  if (visibleCategories.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-4 pt-4 pb-2">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {visibleCategories.map(({ name, icon: Icon, color }) => {
          const count = categoryCounts.get(name) ?? 0;
          const isActive = activeCategory === name;

          return (
            <button
              key={name}
              onClick={() => onCategorySelect(isActive ? null : name)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-rose-500 bg-rose-500/10 scale-105'
                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-[11px] font-medium text-slate-300 leading-tight text-center">
                {name}
              </span>
              <span className="text-[10px] text-slate-500">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
