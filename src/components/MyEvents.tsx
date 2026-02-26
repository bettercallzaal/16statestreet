'use client';

import { useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, MapPin, Download, Trash2 } from 'lucide-react';
import type { ETHDenverEvent, RSVPData } from '@/lib/types';

interface MyEventsProps {
  isOpen: boolean;
  onClose: () => void;
  rsvps: RSVPData[];
  events: ETHDenverEvent[];
  onCancelRSVP: (eventId: string) => void;
  onEventClick?: (event: ETHDenverEvent) => void;
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,]/g, (match) => '\\' + match).replace(/\n/g, '\\n');
}

function generateBatchICS(events: ETHDenverEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Heart of Ellsworth//Events//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const event of events) {
    const dateClean = event.dateISO.replace(/-/g, '');
    let dtStart = `${dateClean}`;
    let dtEnd = `${dateClean}`;

    if (!event.isAllDay) {
      const parseTime = (t: string) => {
        const m = t.toLowerCase().trim().match(/(\d{1,2}):?(\d{2})?\s*(am?|pm?)?/i);
        if (!m) return '000000';
        let h = parseInt(m[1]);
        const min = m[2] ? parseInt(m[2]) : 0;
        if (m[3]?.startsWith('p') && h !== 12) h += 12;
        if (m[3]?.startsWith('a') && h === 12) h = 0;
        return `${String(h).padStart(2, '0')}${String(min).padStart(2, '0')}00`;
      };
      dtStart = `${dateClean}T${parseTime(event.startTime)}`;
      dtEnd = event.endTime ? `${dateClean}T${parseTime(event.endTime)}` : dtStart;
    }

    lines.push(
      'BEGIN:VEVENT',
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICS(event.name)}`,
      event.address ? `LOCATION:${escapeICS(event.address)}` : '',
      event.organizer ? `ORGANIZER:${escapeICS(event.organizer)}` : '',
      `UID:${event.id}@heartofellsworth`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}

export function MyEvents({ isOpen, onClose, rsvps, events, onCancelRSVP, onEventClick }: MyEventsProps) {
  const registeredEvents = useMemo(() => {
    const rsvpMap = new Map(rsvps.map((r) => [r.eventId, r]));
    return events
      .filter((e) => rsvpMap.has(e.id))
      .sort((a, b) => {
        if (a.dateISO !== b.dateISO) return a.dateISO.localeCompare(b.dateISO);
        return a.startTime.localeCompare(b.startTime);
      })
      .map((e) => ({ event: e, rsvp: rsvpMap.get(e.id)! }));
  }, [rsvps, events]);

  const handleExportAll = useCallback(() => {
    if (registeredEvents.length === 0) return;
    const ics = generateBatchICS(registeredEvents.map((r) => r.event));
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-ellsworth-events.ics';
    a.click();
    URL.revokeObjectURL(url);
  }, [registeredEvents]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md bg-slate-900 border-l border-slate-700 h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-white">My Events</h2>
            <p className="text-xs text-slate-500">{registeredEvents.length} registered</p>
          </div>
          <div className="flex items-center gap-2">
            {registeredEvents.length > 0 && (
              <button
                onClick={handleExportAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 text-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="p-4">
          {registeredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="font-medium">No registered events yet</p>
              <p className="text-sm mt-1">Browse events and register to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {registeredEvents.map(({ event, rsvp }) => (
                <div
                  key={event.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onEventClick?.(event)}
                      className="text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <h3 className="font-semibold text-white text-sm leading-tight hover:text-rose-400 transition-colors">
                        {event.name}
                      </h3>
                      {event.organizer && (
                        <p className="text-xs text-slate-500 mt-0.5">{event.organizer}</p>
                      )}
                    </button>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rsvp.status === 'confirmed'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {rsvp.status === 'confirmed' ? 'Confirmed' : 'Waitlisted'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{event.date} · {event.isAllDay ? 'All Day' : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}</span>
                    </div>
                    {event.address && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{event.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <button
                      onClick={() => onCancelRSVP(event.id)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
