'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Check,
  Download,
} from 'lucide-react';
import type { ETHDenverEvent, RSVPData } from '@/lib/types';
import { STORAGE_KEYS, VIBE_COLORS } from '@/lib/constants';

/* ---------- Mock attendee names for the preview row ---------- */
const MOCK_ATTENDEES = [
  'Alex Rivera',
  'Jordan Lee',
  'Taylor Kim',
  'Morgan Chen',
  'Casey Patel',
  'Riley Nguyen',
  'Avery Brooks',
  'Quinn Tanaka',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ---------- ICS helpers ---------- */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function parseTimeSimple(t: string): { hour: number; minute: number } | null {
  if (!t) return null;
  const normalized = t.toLowerCase().trim();
  if (normalized === 'all day' || normalized === 'tbd') return null;
  const match = normalized.match(/(\d{1,2}):?(\d{2})?\s*(am?|pm?)?/i);
  if (!match) return null;
  let hour = parseInt(match[1]);
  const minute = match[2] ? parseInt(match[2]) : 0;
  const isPM = match[3] && match[3].startsWith('p');
  const isAM = match[3] && match[3].startsWith('a');
  if (isPM && hour !== 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  return { hour, minute };
}

function toICSDateTime(dateISO: string, time: { hour: number; minute: number }): string {
  const date = dateISO.replace(/-/g, '');
  const h = time.hour.toString().padStart(2, '0');
  const m = time.minute.toString().padStart(2, '0');
  return `${date}T${h}${m}00`;
}

function generateSingleICS(event: ETHDenverEvent): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//sheeets.xyz//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${escapeICS(event.name)}`,
    `UID:${event.id}@sheeets.xyz`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
  ];

  if (event.isAllDay && event.dateISO) {
    lines.push(`DTSTART;VALUE=DATE:${event.dateISO.replace(/-/g, '')}`);
    const nextDay = new Date(event.dateISO);
    nextDay.setDate(nextDay.getDate() + 1);
    lines.push(
      `DTEND;VALUE=DATE:${nextDay.toISOString().slice(0, 10).replace(/-/g, '')}`,
    );
  } else if (event.dateISO) {
    const startTime = parseTimeSimple(event.startTime);
    if (startTime) {
      lines.push(`DTSTART:${toICSDateTime(event.dateISO, startTime)}`);
      const endTime = parseTimeSimple(event.endTime);
      const end = endTime
        ? toICSDateTime(event.dateISO, endTime)
        : toICSDateTime(event.dateISO, {
            hour: startTime.hour + 1,
            minute: startTime.minute,
          });
      lines.push(`DTEND:${end}`);
    }
  }

  if (event.address) lines.push(`LOCATION:${escapeICS(event.address)}`);

  const desc: string[] = [];
  if (event.organizer) desc.push(`Organized by: ${event.organizer}`);
  if (event.link) desc.push(`Link: ${event.link}`);
  if (desc.length > 0) lines.push(`DESCRIPTION:${escapeICS(desc.join('\\n'))}`);
  if (event.link) lines.push(`URL:${event.link}`);

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

function downloadICSFile(event: ETHDenverEvent) {
  const content = generateSingleICS(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- Props ---------- */
interface EventDetailProps {
  event: ETHDenverEvent;
  isOpen: boolean;
  onClose: () => void;
  rsvps: RSVPData[];
  onRSVP: (rsvp: RSVPData) => void;
  onCancelRSVP: (eventId: string) => void;
}

/* ---------- Component ---------- */
export function EventDetail({
  event,
  isOpen,
  onClose,
  rsvps,
  onRSVP,
  onCancelRSVP,
}: EventDetailProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track whether the panel is visually open (for animation)
  const [visible, setVisible] = useState(false);

  // Mount portal on client only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      // Small delay so the browser can paint the "off-screen" state first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Derived state
  const existingRsvp = rsvps.find((r) => r.eventId === event.id);
  const isFull =
    event.capacity != null && (event.registeredCount ?? 0) >= event.capacity;
  const spotsUsed = event.registeredCount ?? 0;

  // Hero gradient color from the first tag
  const firstTag = event.tags[0];
  const heroColor = (firstTag && VIBE_COLORS[firstTag]) || '#f43f5e'; // rose-500

  const timeDisplay = event.isAllDay
    ? 'All Day'
    : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`;

  const googleMapsUrl = event.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`
    : null;

  /* ---------- Handlers ---------- */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const rsvpData: RSVPData = {
      eventId: event.id,
      name: name.trim(),
      email: email.trim(),
      registeredAt: new Date().toISOString(),
      status:
        event.capacity != null && (event.registeredCount ?? 0) >= event.capacity
          ? 'waitlisted'
          : 'confirmed',
    };
    onRSVP(rsvpData);
    setName('');
    setEmail('');
  }

  function handleShare() {
    const shareText = [
      event.name,
      event.organizer ? `by ${event.organizer}` : '',
      `${event.date} ${timeDisplay}`,
      event.address || '',
      event.link || '',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCancel() {
    onCancelRSVP(event.id);
  }

  /* ---------- Don't render if not open and animation complete, or not mounted ---------- */
  if (!mounted || !isOpen) return null;

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/60 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] max-w-lg w-full bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* Hero section */}
          <div
            className="relative h-48 flex items-end p-6"
            style={{
              background: `linear-gradient(135deg, ${heroColor}CC 0%, ${heroColor}44 60%, rgba(15,23,42,1) 100%)`,
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {event.tags.map((tag) => {
                    const tagColor = VIBE_COLORS[tag] || VIBE_COLORS['default'];
                    return (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `${tagColor}33`,
                          color: tagColor,
                          border: `1px solid ${tagColor}55`,
                        }}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 -mt-4 relative z-10">
            {/* Event name & organizer */}
            <h2 className="text-2xl font-bold text-white leading-tight">
              {event.name}
            </h2>
            {event.organizer && (
              <p className="text-slate-400 text-sm mt-1">
                by {event.organizer}
              </p>
            )}

            {/* Meta rows */}
            <div className="mt-5 space-y-3">
              {/* Date + time */}
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  {event.date} &middot; {timeDisplay}
                </span>
              </div>

              {/* Address */}
              {event.address && (
                <div className="flex items-start gap-3 text-slate-300 text-sm">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  {googleMapsUrl ? (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-rose-400 transition-colors underline underline-offset-2"
                    >
                      {event.address}
                    </a>
                  ) : (
                    <span>{event.address}</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {event.description || 'No description available.'}
              </p>
            </div>

            {/* Capacity section */}
            {event.capacity != null && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Capacity
                </h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">
                    {spotsUsed} / {event.capacity} spots filled
                  </span>
                  {isFull && (
                    <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                      Event Full
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        (spotsUsed / event.capacity) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Attendee preview */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-rose-400" />
                <span className="text-sm text-slate-300 font-medium">
                  {spotsUsed > 0 ? `${spotsUsed} people going` : 'Be the first to register!'}
                </span>
              </div>
              {spotsUsed > 0 && (
                <div className="flex items-center -space-x-2">
                  {MOCK_ATTENDEES.slice(0, Math.min(spotsUsed, 6)).map(
                    (attendee, i) => {
                      const colors = [
                        'bg-rose-500',
                        'bg-blue-500',
                        'bg-emerald-500',
                        'bg-amber-500',
                        'bg-purple-500',
                        'bg-cyan-500',
                      ];
                      return (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full ${colors[i % colors.length]} flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900`}
                          title={attendee}
                        >
                          {getInitials(attendee)}
                        </div>
                      );
                    },
                  )}
                  {spotsUsed > 6 && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold border-2 border-slate-900">
                      +{spotsUsed - 6}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <hr className="border-slate-700 my-6" />

            {/* RSVP section */}
            {!existingRsvp ? (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  {isFull
                    ? 'Join the waitlist'
                    : 'Register for this event'}
                </h3>
                {isFull && (
                  <p className="text-sm text-slate-400 mb-3">
                    {spotsUsed - (event.capacity ?? 0)} people ahead of you
                  </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="rsvp-name"
                      className="block text-xs font-medium text-slate-400 mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="rsvp-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="rsvp-email"
                      className="block text-xs font-medium text-slate-400 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="rsvp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg font-semibold text-sm text-white transition-all cursor-pointer bg-rose-500 hover:bg-rose-600 active:scale-[0.98]"
                  >
                    {isFull ? 'Join Waitlist' : 'Register'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {/* Registered confirmation */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center rsvp-check-animate">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">
                      You&apos;re registered!
                    </p>
                    <p className="text-xs text-slate-400">
                      {existingRsvp.status === 'waitlisted'
                        ? 'You are on the waitlist'
                        : 'Your spot is confirmed'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-4 mb-4 space-y-1">
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500">Name:</span>{' '}
                    {existingRsvp.name}
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500">Email:</span>{' '}
                    {existingRsvp.email}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => downloadICSFile(event)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-750 hover:text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Add to Calendar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-sm text-slate-500 hover:text-red-400 transition-colors cursor-pointer py-2"
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <hr className="border-slate-700 my-6" />

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-750 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share Event
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
