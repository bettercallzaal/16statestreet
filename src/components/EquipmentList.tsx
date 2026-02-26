'use client';

import { useState, useEffect } from 'react';
import { Wrench, MapPin, CheckCircle, Clock, ArrowDownToLine, RotateCcw } from 'lucide-react';
import spacesData from '@/data/demo-spaces.json';
import { STORAGE_KEYS } from '@/lib/constants';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Equipment {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'checked-out';
  returnDate: string | null;
  checkedOutBy: string | null;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EquipmentList() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  /* ---------- load & merge on mount ---------- */

  useEffect(() => {
    const defaults: Equipment[] = spacesData.equipment as Equipment[];

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
      if (raw) {
        const overrides: Equipment[] = JSON.parse(raw);
        const overrideMap = new Map(overrides.map((e) => [e.id, e]));
        const merged = defaults.map((d) => overrideMap.get(d.id) ?? d);
        setEquipment(merged);
      } else {
        setEquipment(defaults);
      }
    } catch {
      setEquipment(defaults);
    }
  }, []);

  /* ---------- persist helper ---------- */

  function persist(updated: Equipment[]) {
    setEquipment(updated);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(updated));
  }

  /* ---------- toggle status ---------- */

  function handleToggle(id: string) {
    const updated = equipment.map((item) => {
      if (item.id !== id) return item;

      if (item.status === 'available') {
        // Check out: set 7-day return date
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 7);
        const yyyy = returnDate.getFullYear();
        const mm = String(returnDate.getMonth() + 1).padStart(2, '0');
        const dd = String(returnDate.getDate()).padStart(2, '0');
        return {
          ...item,
          status: 'checked-out' as const,
          returnDate: `${yyyy}-${mm}-${dd}`,
          checkedOutBy: 'You',
        };
      }

      // Return
      return {
        ...item,
        status: 'available' as const,
        returnDate: null,
        checkedOutBy: null,
      };
    });
    persist(updated);
  }

  /* ---------- render ---------- */

  return (
    <section className="mt-10">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-5 h-5 text-rose-400" />
        <h2 className="text-lg font-bold text-white">Equipment</h2>
      </div>

      {/* Equipment grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {equipment.map((item) => {
          const isAvailable = item.status === 'available';

          return (
            <div
              key={item.id}
              className="rounded-lg bg-slate-800 border border-slate-700 p-4 flex flex-col gap-2"
            >
              {/* Name */}
              <h3 className="text-sm font-semibold text-white">{item.name}</h3>

              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                <span>{item.location}</span>
              </div>

              {/* Status badge */}
              {isAvailable ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5 w-fit">
                  <CheckCircle className="w-3 h-3" />
                  Available
                </span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5 w-fit">
                    <Clock className="w-3 h-3" />
                    Checked Out
                  </span>
                  {item.checkedOutBy && (
                    <span className="text-xs text-slate-500 ml-1">
                      by {item.checkedOutBy}
                    </span>
                  )}
                  {item.returnDate && (
                    <span className="text-xs text-slate-500 ml-1">
                      Return by {item.returnDate}
                    </span>
                  )}
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => handleToggle(item.id)}
                className={[
                  'mt-auto flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  isAvailable
                    ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
                ].join(' ')}
              >
                {isAvailable ? (
                  <>
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    Check Out
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    Return
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
