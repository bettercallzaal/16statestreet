'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { ETHDenverEvent } from '@/lib/types';
import { VIBE_COLORS } from '@/lib/constants';

interface CalendarViewProps {
  events: ETHDenverEvent[];
  itinerary?: Set<string>;
  onItineraryToggle?: (eventId: string) => void;
  onEventClick?: (event: ETHDenverEvent) => void;
}

/* ------------------------------------------------------------------ */
/*  Helper functions                                                   */
/* ------------------------------------------------------------------ */

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDayHeader(dateISO: string): string {
  const date = new Date(dateISO + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function getVibeColor(event: ETHDenverEvent): string {
  const tag = event.tags?.[0] ?? event.vibe ?? '';
  return VIBE_COLORS[tag] ?? VIBE_COLORS['default'] ?? '#6B7280';
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CalendarView({
  events,
  itinerary,
  onItineraryToggle,
  onEventClick,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  /* ---------- derived data ---------- */

  // Index events by dateISO for fast lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, ETHDenverEvent[]>();
    for (const ev of events) {
      const key = ev.dateISO;
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const getEventsForDay = useCallback(
    (dateISO: string): ETHDenverEvent[] => eventsByDate.get(dateISO) ?? [],
    [eventsByDate],
  );

  // Build the grid cells (6 rows x 7 cols = 42 cells max)
  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Previous month filler
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const cells: {
      day: number;
      month: number;
      year: number;
      dateISO: string;
      isCurrentMonth: boolean;
    }[] = [];

    // Leading days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      cells.push({
        day: d,
        month: prevMonth,
        year: prevYear,
        dateISO: toISODate(prevYear, prevMonth, d),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        month,
        year,
        dateISO: toISODate(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Trailing days from next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        dateISO: toISODate(nextYear, nextMonth, d),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  const todayISO = useMemo(() => {
    const now = new Date();
    return toISODate(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const dayEvents = getEventsForDay(selectedDay);
    // Sort by start time
    return [...dayEvents].sort((a, b) => {
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [selectedDay, getEventsForDay]);

  /* ---------- navigation handlers ---------- */

  function goToPrevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function goToNextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  function handleDayClick(dateISO: string) {
    setSelectedDay((prev) => (prev === dateISO ? null : dateISO));
  }

  /* ---------- render ---------- */

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 pb-8">
      {/* Month navigation header */}
      <div className="flex items-center justify-between py-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-white">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-slate-500 py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-700/30 rounded-lg overflow-hidden">
        {calendarCells.map((cell, idx) => {
          const dayEvents = getEventsForDay(cell.dateISO);
          const isToday = cell.dateISO === todayISO;
          const isSelected = cell.dateISO === selectedDay;
          const hasItineraryEvent =
            itinerary && dayEvents.some((ev) => itinerary.has(ev.id));

          // Pick up to 3 distinct vibe colors for dot indicators
          const dotColors: string[] = [];
          const seen = new Set<string>();
          for (const ev of dayEvents) {
            const c = getVibeColor(ev);
            if (!seen.has(c)) {
              seen.add(c);
              dotColors.push(c);
            }
            if (dotColors.length >= 3) break;
          }

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(cell.dateISO)}
              className={[
                'relative flex flex-col items-start p-1 sm:p-2',
                'min-h-[40px] sm:min-h-[80px]',
                'bg-slate-800/50 hover:bg-slate-700 transition-colors',
                'text-left focus:outline-none focus:z-10',
                !cell.isCurrentMonth && 'opacity-40',
                isSelected && 'border-2 border-rose-500 z-10',
                !isSelected && 'border border-transparent',
                isToday && !isSelected && 'ring-1 ring-rose-500',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${cell.day} ${MONTH_NAMES[cell.month]} ${cell.year}, ${dayEvents.length} events`}
            >
              {/* Day number */}
              <span
                className={[
                  'text-xs sm:text-sm font-medium leading-none',
                  cell.isCurrentMonth ? 'text-slate-200' : 'text-slate-600',
                  isToday && 'text-rose-400 font-bold',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {cell.day}
              </span>

              {/* Event count on mobile */}
              {dayEvents.length > 0 && (
                <span className="sm:hidden text-[10px] text-slate-400 mt-0.5">
                  {dayEvents.length}
                </span>
              )}

              {/* Dots for event vibes */}
              {dotColors.length > 0 && (
                <div className="flex gap-0.5 mt-auto pt-1">
                  {dotColors.map((color, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="hidden sm:inline text-[10px] text-slate-500 leading-none ml-0.5">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Itinerary indicator */}
              {hasItineraryEvent && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events panel */}
      {selectedDay && (
        <div className="mt-4 rounded-lg bg-slate-800/70 border border-slate-700 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <h3 className="text-sm font-bold text-white">
              {formatDayHeader(selectedDay)}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {selectedDayEvents.length} event
              {selectedDayEvents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Event list */}
          {selectedDayEvents.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              No events on this day
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-700/50">
              {selectedDayEvents.map((event) => {
                const isInItinerary = itinerary?.has(event.id);
                const vibeColor = getVibeColor(event);

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors group"
                  >
                    {/* Vibe color bar */}
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: vibeColor }}
                    />

                    {/* Event info - clickable */}
                    <button
                      className="flex-1 min-w-0 text-left focus:outline-none"
                      onClick={() => onEventClick?.(event)}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-400 font-mono flex-shrink-0">
                          {event.isAllDay
                            ? 'All day'
                            : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white truncate mt-0.5 group-hover:text-rose-300 transition-colors">
                        {event.name}
                      </p>
                      {event.organizer && (
                        <p className="text-xs text-slate-500 truncate">
                          {event.organizer}
                        </p>
                      )}
                    </button>

                    {/* Itinerary star toggle */}
                    {onItineraryToggle && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onItineraryToggle(event.id);
                        }}
                        className={[
                          'p-1.5 rounded-lg transition-colors flex-shrink-0',
                          isInItinerary
                            ? 'text-yellow-400 hover:text-yellow-300'
                            : 'text-slate-600 hover:text-slate-400',
                        ].join(' ')}
                        aria-label={
                          isInItinerary
                            ? 'Remove from itinerary'
                            : 'Add to itinerary'
                        }
                      >
                        <Star
                          className="w-4 h-4"
                          fill={isInItinerary ? 'currentColor' : 'none'}
                        />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
