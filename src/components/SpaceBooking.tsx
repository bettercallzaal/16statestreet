'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  X,
  Plus,
  LayoutGrid,
} from 'lucide-react';
import spacesData from '@/data/demo-spaces.json';
import demoBookings from '@/data/demo-bookings.json';
import { STORAGE_KEYS } from '@/lib/constants';
import { EquipmentList } from './EquipmentList';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Space {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  description: string;
  amenities: string[];
  hourlyRate: number;
  color: string;
}

interface Booking {
  id: string;
  spaceId: string;
  title: string;
  date: string;        // YYYY-MM-DD
  startHour: number;   // 0-23
  endHour: number;     // 0-23
  bookedBy: string;
  purpose: string;
}

interface BookingFormData {
  name: string;
  purpose: string;
  date: string;
  startHour: number;
  endHour: number;
  spaceId: string;
  equipment: string[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const spaces: Space[] = spacesData.spaces as Space[];
const equipmentList = spacesData.equipment;

const PURPOSES = [
  'Workshop',
  'Open Studio',
  'Meeting',
  'Exhibition',
  'Coworking',
  'Other',
];

const START_HOUR = 8;
const END_HOUR = 21; // 9 PM
const TOTAL_SLOTS = END_HOUR - START_HOUR; // 13 one-hour slots

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Get Monday of the week containing `date`. */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun,1=Mon,...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatHour(h: number): string {
  if (h === 0 || h === 12) return h === 0 ? '12 AM' : '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function formatDateRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = monday.toLocaleDateString('en-US', opts);
  const end = sunday.toLocaleDateString('en-US', {
    ...opts,
    year: 'numeric',
  });
  return `${start} - ${end}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SpaceBooking() {
  /* ---------- state ---------- */

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    purpose: 'Workshop',
    date: '',
    startHour: START_HOUR,
    endHour: START_HOUR + 1,
    spaceId: '',
    equipment: [],
  });

  /* ---------- load bookings on mount ---------- */

  useEffect(() => {
    const demo: Booking[] = demoBookings as Booking[];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      if (raw) {
        const stored: Booking[] = JSON.parse(raw);
        // Merge: demo + stored (stored may contain user-created bookings)
        const demoIds = new Set(demo.map((b) => b.id));
        const extra = stored.filter((b) => !demoIds.has(b.id));
        setBookings([...demo, ...extra]);
      } else {
        setBookings(demo);
      }
    } catch {
      setBookings(demo);
    }
  }, []);

  /* ---------- derived: current week days ---------- */

  const monday = useMemo(() => {
    const today = new Date();
    const m = getMonday(today);
    return addDays(m, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(monday, i)),
    [monday],
  );

  const weekDayISOs = useMemo(() => weekDays.map(toISODate), [weekDays]);

  /* ---------- derived: filtered bookings ---------- */

  const visibleBookings = useMemo(() => {
    const dateSet = new Set(weekDayISOs);
    return bookings.filter((b) => {
      if (!dateSet.has(b.date)) return false;
      if (selectedSpace && b.spaceId !== selectedSpace) return false;
      return true;
    });
  }, [bookings, weekDayISOs, selectedSpace]);

  /* ---------- space color lookup ---------- */

  const spaceColorMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of spaces) m.set(s.id, s.color);
    return m;
  }, []);

  /* ---------- booking form handlers ---------- */

  const openForm = useCallback(
    (dayIndex: number, hour: number) => {
      const dateISO = weekDayISOs[dayIndex];
      setFormData({
        name: '',
        purpose: 'Workshop',
        date: dateISO,
        startHour: hour,
        endHour: Math.min(hour + 1, END_HOUR),
        spaceId: selectedSpace ?? spaces[0].id,
        equipment: [],
      });
      setFormOpen(true);
    },
    [weekDayISOs, selectedSpace],
  );

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newBooking: Booking = {
      id: `user-booking-${Date.now()}`,
      spaceId: formData.spaceId,
      title: formData.name.trim(),
      date: formData.date,
      startHour: formData.startHour,
      endHour: formData.endHour,
      bookedBy: formData.name.trim(),
      purpose: formData.purpose.toLowerCase().replace(' ', '-'),
    };

    const updated = [...bookings, newBooking];
    setBookings(updated);

    // Persist user-created bookings
    const demoIds = new Set((demoBookings as Booking[]).map((b) => b.id));
    const userBookings = updated.filter((b) => !demoIds.has(b.id));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(userBookings));

    setFormOpen(false);
  }

  function toggleEquipment(eqId: string) {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eqId)
        ? prev.equipment.filter((id) => id !== eqId)
        : [...prev.equipment, eqId],
    }));
  }

  /* ---------- render helpers ---------- */

  /** Check if a slot is occupied by any visible booking. */
  function getBookingAt(dayIndex: number, hour: number): Booking | undefined {
    const dateISO = weekDayISOs[dayIndex];
    return visibleBookings.find(
      (b) => b.date === dateISO && hour >= b.startHour && hour < b.endHour,
    );
  }

  /** Get the booking that *starts* at this slot (for rendering the block). */
  function getBookingStartingAt(
    dayIndex: number,
    hour: number,
  ): Booking | undefined {
    const dateISO = weekDayISOs[dayIndex];
    return visibleBookings.find(
      (b) => b.date === dateISO && b.startHour === hour,
    );
  }

  /* ---------- time select options ---------- */

  const hourOptions = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i,
  );

  /* ================================================================ */
  /*  RENDER                                                          */
  /* ================================================================ */

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      {/* ---- Space cards row ---- */}
      <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-hide">
        {/* "All" button */}
        <button
          onClick={() => setSelectedSpace(null)}
          className={[
            'flex-shrink-0 rounded-lg border px-4 py-3 text-left transition-colors min-w-[140px]',
            selectedSpace === null
              ? 'border-rose-500 bg-rose-500/10'
              : 'border-slate-700 bg-slate-800 hover:bg-slate-700',
          ].join(' ')}
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-white">All Spaces</span>
          </div>
        </button>

        {spaces.map((space) => (
          <button
            key={space.id}
            onClick={() =>
              setSelectedSpace((prev) =>
                prev === space.id ? null : space.id,
              )
            }
            className={[
              'flex-shrink-0 rounded-lg border px-4 py-3 text-left transition-colors min-w-[160px]',
              selectedSpace === space.id
                ? 'border-rose-500 bg-rose-500/10'
                : 'border-slate-700 bg-slate-800 hover:bg-slate-700',
            ].join(' ')}
            style={{ borderLeftWidth: '4px', borderLeftColor: space.color }}
          >
            <span className="text-sm font-semibold text-white block">
              {space.name}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">{space.floor}</span>
              <span className="flex items-center gap-0.5 text-xs text-slate-500">
                <Users className="w-3 h-3" />
                {space.capacity}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ---- Week navigation ---- */}
      <div className="flex items-center justify-between py-3">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold text-white">
            {formatDateRange(monday)}
          </h2>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors mt-0.5"
            >
              Back to this week
            </button>
          )}
        </div>

        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ---- Weekly calendar grid ---- */}
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <div
          className="min-w-[700px]"
          style={{
            display: 'grid',
            gridTemplateColumns: '60px repeat(7, 1fr)',
            gridTemplateRows: `auto repeat(${TOTAL_SLOTS}, 48px)`,
          }}
        >
          {/* Top-left corner */}
          <div className="bg-slate-800 border-b border-r border-slate-700 sticky left-0 z-10" />

          {/* Column headers (Mon-Sun) */}
          {weekDays.map((day, i) => {
            const todayISO = toISODate(new Date());
            const dayISO = toISODate(day);
            const isToday = dayISO === todayISO;

            return (
              <div
                key={i}
                className={[
                  'text-center py-2 border-b border-slate-700 bg-slate-800',
                  i < 6 && 'border-r',
                ].filter(Boolean).join(' ')}
              >
                <div
                  className={[
                    'text-xs font-semibold',
                    isToday ? 'text-rose-400' : 'text-slate-400',
                  ].join(' ')}
                >
                  {DAY_NAMES[i]}
                </div>
                <div
                  className={[
                    'text-sm font-bold',
                    isToday ? 'text-rose-300' : 'text-white',
                  ].join(' ')}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}

          {/* Time rows */}
          {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
            const hour = START_HOUR + slotIdx;

            return (
              <div key={`row-${hour}`} style={{ display: 'contents' }}>
                {/* Time label */}
                <div
                  className="text-xs text-slate-500 text-right pr-2 pt-1 border-r border-slate-700 bg-slate-900 sticky left-0 z-10"
                  style={{
                    gridRow: slotIdx + 2,
                    gridColumn: 1,
                    borderBottom:
                      slotIdx < TOTAL_SLOTS - 1
                        ? '1px solid rgb(51 65 85 / 0.5)'
                        : undefined,
                  }}
                >
                  {formatHour(hour)}
                </div>

                {/* Day cells */}
                {weekDays.map((_, dayIdx) => {
                  const occupied = getBookingAt(dayIdx, hour);
                  const startsHere = getBookingStartingAt(dayIdx, hour);

                  // If a booking spans this cell but doesn't start here, render empty (the block
                  // from the starting row spans over this cell visually).
                  if (occupied && !startsHere) {
                    return null;
                  }

                  if (startsHere) {
                    const duration = startsHere.endHour - startsHere.startHour;
                    const color =
                      spaceColorMap.get(startsHere.spaceId) ?? '#6B7280';
                    const spaceName =
                      spaces.find((s) => s.id === startsHere.spaceId)?.name ??
                      '';

                    return (
                      <div
                        key={`${dayIdx}-${hour}`}
                        className="relative p-0.5"
                        style={{
                          gridRow: `${slotIdx + 2} / span ${duration}`,
                          gridColumn: dayIdx + 2,
                          borderRight:
                            dayIdx < 6
                              ? '1px solid rgb(51 65 85 / 0.5)'
                              : undefined,
                        }}
                      >
                        <div
                          className="absolute inset-0.5 rounded-md p-1.5 overflow-hidden cursor-default"
                          style={{
                            backgroundColor: `${color}22`,
                            borderLeft: `3px solid ${color}`,
                          }}
                        >
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color }}
                          >
                            {startsHere.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {formatHour(startsHere.startHour)} -{' '}
                            {formatHour(startsHere.endHour)}
                            {selectedSpace === null && spaceName
                              ? ` \u00B7 ${spaceName}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Empty slot - clickable
                  return (
                    <button
                      key={`${dayIdx}-${hour}`}
                      onClick={() => openForm(dayIdx, hour)}
                      className="group hover:bg-slate-800/80 transition-colors"
                      style={{
                        gridRow: slotIdx + 2,
                        gridColumn: dayIdx + 2,
                        borderRight:
                          dayIdx < 6
                            ? '1px solid rgb(51 65 85 / 0.5)'
                            : undefined,
                        borderBottom:
                          slotIdx < TOTAL_SLOTS - 1
                            ? '1px solid rgb(51 65 85 / 0.5)'
                            : undefined,
                      }}
                      aria-label={`Book ${DAY_NAMES[dayIdx]} ${formatHour(hour)}`}
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 mx-auto transition-colors" />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Booking form modal ---- */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-800 border border-slate-700 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h3 className="text-base font-bold text-white">
                Book a Space
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="px-5 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  placeholder="Your name or event title"
                />
              </div>

              {/* Space */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Space
                </label>
                <select
                  value={formData.spaceId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      spaceId: e.target.value,
                    }))
                  }
                  className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                >
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.floor}, cap {s.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Purpose
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      purpose: e.target.value,
                    }))
                  }
                  className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Start / End time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Start Time
                  </label>
                  <select
                    value={formData.startHour}
                    onChange={(e) => {
                      const start = Number(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        startHour: start,
                        endHour: Math.max(prev.endHour, start + 1),
                      }));
                    }}
                    className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  >
                    {hourOptions.slice(0, -1).map((h) => (
                      <option key={h} value={h}>
                        {formatHour(h)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    End Time
                  </label>
                  <select
                    value={formData.endHour}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endHour: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-md bg-slate-900 border border-slate-600 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  >
                    {hourOptions
                      .filter((h) => h > formData.startHour)
                      .map((h) => (
                        <option key={h} value={h}>
                          {formatHour(h)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Equipment checkboxes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Equipment Needed
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {equipmentList.map((eq) => (
                    <label
                      key={eq.id}
                      className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.equipment.includes(eq.id)}
                        onChange={() => toggleEquipment(eq.id)}
                        className="rounded border-slate-600 bg-slate-900 text-rose-500 focus:ring-rose-500 focus:ring-offset-0"
                      />
                      {eq.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  Book Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Equipment section ---- */}
      <EquipmentList />
    </div>
  );
}
