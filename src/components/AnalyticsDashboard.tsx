'use client';

import { useMemo } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  CalendarCheck,
  Clock,
  Tag,
  Building2,
  DollarSign,
  Trophy,
} from 'lucide-react';
import eventsData from '@/data/demo-events.json';
import spacesData from '@/data/demo-spaces.json';

interface DemoEvent {
  name: string;
  dateISO: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  organizer: string;
  address: string;
  cost: string;
  tags: string[];
  hasFood: boolean;
  hasBar: boolean;
  description?: string;
  capacity?: number;
  registeredCount?: number;
}

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

const events: DemoEvent[] = eventsData as DemoEvent[];
const spaces: Space[] = (spacesData as { spaces: Space[] }).spaces;

/** Parse "7:00 PM" / "10:00 AM" etc. into 0-23 hour */
function parseHour(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === 'AM' && h === 12) h = 0;
  if (ampm === 'PM' && h !== 12) h += 12;
  return h;
}

/** Check if a dateISO falls on Saturday or Sunday */
function isWeekend(dateISO: string): boolean {
  const d = new Date(dateISO + 'T12:00:00');
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Color palette for tag categories */
function tagColor(tag: string): string {
  const green = ['Workshop', 'Kids/Family', 'Open Studio', 'Coworking'];
  const blue = ['Makerspace', 'Arts', 'Film'];
  const yellow = ['Music', 'Food', 'Wellness', 'Outdoors'];
  if (green.includes(tag)) return 'bg-emerald-500';
  if (blue.includes(tag)) return 'bg-sky-500';
  if (yellow.includes(tag)) return 'bg-amber-500';
  return 'bg-rose-500';
}

export function AnalyticsDashboard() {
  // ── Section 1: Overview Stats ──────────────────────────────
  const overview = useMemo(() => {
    const totalEvents = events.length;
    const totalRegistrations = events.reduce(
      (sum, e) => sum + (e.registeredCount ?? 0),
      0
    );
    const withCapacity = events.filter(
      (e) => e.capacity && e.capacity > 0 && e.registeredCount !== undefined
    );
    const avgFillRate =
      withCapacity.length > 0
        ? withCapacity.reduce(
            (sum, e) => sum + (e.registeredCount! / e.capacity!) * 100,
            0
          ) / withCapacity.length
        : 0;
    const soldOut = events.filter(
      (e) =>
        e.capacity &&
        e.registeredCount !== undefined &&
        e.registeredCount >= e.capacity
    ).length;
    return { totalEvents, totalRegistrations, avgFillRate, soldOut };
  }, []);

  // ── Section 2: Popular Time Slots ──────────────────────────
  const timeSlots = useMemo(() => {
    const buckets: Record<string, number> = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Weekend: 0,
    };
    events.forEach((e) => {
      if (isWeekend(e.dateISO)) {
        buckets['Weekend'] += 1;
      }
      const h = parseHour(e.startTime);
      if (h >= 6 && h < 12) buckets['Morning'] += 1;
      else if (h >= 12 && h < 17) buckets['Afternoon'] += 1;
      else if (h >= 17 && h < 21) buckets['Evening'] += 1;
    });
    const max = Math.max(...Object.values(buckets), 1);
    return Object.entries(buckets).map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / max) * 100),
    }));
  }, []);

  // ── Section 3: Category Breakdown ──────────────────────────
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) =>
      e.tags.forEach((t) => {
        counts[t] = (counts[t] ?? 0) + 1;
      })
    );
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const max = sorted.length > 0 ? sorted[0][1] : 1;
    return sorted.map(([tag, count]) => ({
      tag,
      count,
      pct: Math.round((count / max) * 100),
      color: tagColor(tag),
    }));
  }, []);

  // ── Section 4: Capacity Utilization ────────────────────────
  const spaceUtilization = useMemo(() => {
    // Map events to spaces based on tags / keywords
    const spaceMap: Record<string, DemoEvent[]> = {};
    spaces.forEach((s) => (spaceMap[s.id] = []));

    events.forEach((e) => {
      // Only consider events at "16 State Street" for space mapping
      if (!e.address.includes('16 State Street')) return;

      const nameLower = e.name.toLowerCase();
      const tagsLower = e.tags.map((t) => t.toLowerCase());

      if (
        tagsLower.includes('coworking') ||
        nameLower.includes('coworking')
      ) {
        spaceMap['space-5']?.push(e);
      } else if (
        nameLower.includes('gelatin') ||
        nameLower.includes('print')
      ) {
        spaceMap['space-2']?.push(e);
      } else if (
        nameLower.includes('embroidery') ||
        nameLower.includes('stitch') ||
        nameLower.includes('fiber') ||
        nameLower.includes('bargello')
      ) {
        spaceMap['space-3']?.push(e);
      } else if (
        nameLower.includes('art show') ||
        nameLower.includes('gallery') ||
        nameLower.includes('exhibition') ||
        nameLower.includes('closing reception') ||
        nameLower.includes('film')
      ) {
        spaceMap['space-4']?.push(e);
      } else {
        // Default: Main Studio
        spaceMap['space-1']?.push(e);
      }
    });

    return spaces.map((s) => {
      const assigned = spaceMap[s.id] ?? [];
      const withCap = assigned.filter(
        (e) => e.capacity && e.registeredCount !== undefined
      );
      const avgFill =
        withCap.length > 0
          ? withCap.reduce(
              (sum, e) => sum + (e.registeredCount! / e.capacity!) * 100,
              0
            ) / withCap.length
          : 0;
      return {
        name: s.name,
        floor: s.floor,
        eventCount: assigned.length,
        avgFill: Math.round(avgFill),
        color: s.color,
      };
    });
  }, []);

  // ── Section 5: Revenue Snapshot ────────────────────────────
  const revenue = useMemo(() => {
    let freeEvents = 0;
    let paidEvents = 0;
    let totalRevenue = 0;

    events.forEach((e) => {
      if (e.cost.startsWith('$')) {
        paidEvents += 1;
        const price = parseFloat(e.cost.replace('$', ''));
        if (!isNaN(price)) {
          totalRevenue += price * (e.registeredCount ?? 0);
        }
      } else {
        freeEvents += 1;
      }
    });

    return { freeEvents, paidEvents, totalRevenue };
  }, []);

  // ── Section 6: Top Workshops ───────────────────────────────
  const topWorkshops = useMemo(() => {
    return [...events]
      .filter((e) => e.registeredCount !== undefined)
      .sort((a, b) => (b.registeredCount ?? 0) - (a.registeredCount ?? 0))
      .slice(0, 8);
  }, []);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <BarChart3 className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-white">
            Analytics Dashboard
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          Event performance and community engagement at a glance
        </p>
      </div>

      {/* ── Section 1: Overview Stats ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Events',
              value: overview.totalEvents,
              icon: <CalendarCheck className="w-5 h-5 text-rose-400" />,
            },
            {
              label: 'Total Registrations',
              value: overview.totalRegistrations.toLocaleString(),
              icon: <Users className="w-5 h-5 text-rose-400" />,
            },
            {
              label: 'Avg Fill Rate',
              value: `${overview.avgFillRate.toFixed(1)}%`,
              icon: <TrendingUp className="w-5 h-5 text-rose-400" />,
            },
            {
              label: 'Sold Out',
              value: overview.soldOut,
              icon: <Trophy className="w-5 h-5 text-rose-400" />,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
            >
              <div className="flex items-center gap-2 mb-2">
                {card.icon}
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {card.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Popular Time Slots ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-rose-500" />
          Popular Time Slots
        </h2>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
          {timeSlots.map((slot) => (
            <div key={slot.label}>
              <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>{slot.label}</span>
                <span className="text-slate-500">
                  {slot.count} event{slot.count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="h-8 bg-slate-900 rounded-lg overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-lg flex items-center transition-all duration-500"
                  style={{ width: `${slot.pct}%` }}
                >
                  <span className="text-xs font-bold text-white pl-3">
                    {slot.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Category Breakdown ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Tag className="w-5 h-5 text-rose-500" />
          Category Breakdown
        </h2>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
          {categories.map((cat) => (
            <div key={cat.tag}>
              <div className="flex justify-between text-sm text-slate-300 mb-1">
                <span>{cat.tag}</span>
                <span className="text-slate-500">
                  {cat.count} event{cat.count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="h-8 bg-slate-900 rounded-lg overflow-hidden">
                <div
                  className={`h-full ${cat.color} rounded-lg flex items-center transition-all duration-500`}
                  style={{ width: `${cat.pct}%` }}
                >
                  <span className="text-xs font-bold text-white pl-3">
                    {cat.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Capacity Utilization ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-rose-500" />
          Capacity Utilization
        </h2>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
          {spaceUtilization.map((space) => (
            <div key={space.name}>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-medium text-white">
                    {space.name}
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    {space.floor}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">
                    {space.avgFill}%
                  </span>
                  <span className="text-xs text-slate-500 ml-2">
                    ({space.eventCount} event
                    {space.eventCount !== 1 ? 's' : ''})
                  </span>
                </div>
              </div>
              <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(space.avgFill, 100)}%`,
                    backgroundColor: space.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 5: Revenue Snapshot ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-rose-500" />
          Revenue Snapshot
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              Free vs Paid Events
            </p>
            <div className="flex items-end gap-4 mt-2">
              <div>
                <p className="text-3xl font-bold text-emerald-400">
                  {revenue.freeEvents}
                </p>
                <p className="text-xs text-slate-500">Free</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-rose-400">
                  {revenue.paidEvents}
                </p>
                <p className="text-xs text-slate-500">Paid</p>
              </div>
            </div>
            {/* Mini visual ratio bar */}
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden mt-3 flex">
              <div
                className="h-full bg-emerald-400"
                style={{
                  width: `${(revenue.freeEvents / (revenue.freeEvents + revenue.paidEvents)) * 100}%`,
                }}
              />
              <div
                className="h-full bg-rose-400"
                style={{
                  width: `${(revenue.paidEvents / (revenue.freeEvents + revenue.paidEvents)) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
              Est. Workshop Revenue
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              ${revenue.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Based on {revenue.paidEvents} paid events &times; registrations
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 6: Top Workshops ── */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-rose-500" />
          Top Workshops
        </h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
          {topWorkshops.map((event, i) => {
            const fill =
              event.capacity && event.capacity > 0
                ? Math.round(
                    ((event.registeredCount ?? 0) / event.capacity) * 100
                  )
                : null;
            return (
              <div
                key={`${event.name}-${event.dateISO}-${i}`}
                className="flex items-center gap-4 px-4 py-3"
              >
                <span className="text-lg font-bold text-slate-600 w-6 text-right shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {event.name}
                  </p>
                  <p className="text-xs text-slate-400">{event.organizer}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">
                    {event.registeredCount ?? 0}
                    {event.capacity ? (
                      <span className="text-slate-500 font-normal">
                        {' '}
                        / {event.capacity}
                      </span>
                    ) : null}
                  </p>
                  {fill !== null && (
                    <div className="w-20 h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1 ml-auto">
                      <div
                        className={`h-full rounded-full ${
                          fill >= 100 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(fill, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
