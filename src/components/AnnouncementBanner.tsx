'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import type { ETHDenverEvent } from '@/lib/types';

interface AnnouncementBannerProps {
  events: ETHDenverEvent[];
  onEventClick?: (event: ETHDenverEvent) => void;
}

function getTimeUntil(event: ETHDenverEvent): string {
  if (!event.dateISO || event.isAllDay) return 'today';

  const now = new Date();
  const timeParts = event.startTime.toLowerCase().trim().match(/(\d{1,2}):?(\d{2})?\s*(am?|pm?)?/i);
  if (!timeParts) return 'soon';

  let hour = parseInt(timeParts[1]);
  const min = timeParts[2] ? parseInt(timeParts[2]) : 0;
  const isPM = timeParts[3] && timeParts[3].startsWith('p');
  const isAM = timeParts[3] && timeParts[3].startsWith('a');
  if (isPM && hour !== 12) hour += 12;
  if (isAM && hour === 12) hour = 0;

  const eventDate = new Date(`${event.dateISO}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`);
  const diffMs = eventDate.getTime() - now.getTime();

  if (diffMs < 0) return 'now';
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `in ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `in ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `in ${diffDays}d`;
}

export function AnnouncementBanner({ events, onEventClick }: AnnouncementBannerProps) {
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowISO = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;

    return events
      .filter((e) => e.dateISO === todayISO || e.dateISO === tomorrowISO)
      .sort((a, b) => {
        if (a.dateISO !== b.dateISO) return a.dateISO.localeCompare(b.dateISO);
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5);
  }, [events]);

  if (upcomingEvents.length === 0) return null;

  const renderItem = (event: ETHDenverEvent, key: string) => (
    <button
      key={key}
      onClick={() => onEventClick?.(event)}
      className="inline-flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition-colors"
    >
      <Clock className="w-3 h-3 text-rose-400 shrink-0" />
      <span className="font-medium text-slate-300">{event.name}</span>
      <span className="text-rose-400">— {getTimeUntil(event)}</span>
      <span className="mx-4 text-slate-600">&#10022;</span>
    </button>
  );

  return (
    <div className="w-full overflow-hidden bg-slate-900/80 border-b border-slate-800/50 py-1.5">
      <div className="announcement-scroll inline-flex whitespace-nowrap text-xs text-slate-400">
        {/* Duplicate for seamless scroll */}
        <span className="inline-flex items-center">
          <span className="mr-2 text-rose-400 font-semibold">Next up:</span>
          {upcomingEvents.map((e, i) => renderItem(e, `a-${i}`))}
        </span>
        <span className="inline-flex items-center">
          <span className="mr-2 text-rose-400 font-semibold">Next up:</span>
          {upcomingEvents.map((e, i) => renderItem(e, `b-${i}`))}
        </span>
      </div>
    </div>
  );
}
