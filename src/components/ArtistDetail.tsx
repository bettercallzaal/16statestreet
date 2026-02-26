'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Globe,
  Instagram,
  Calendar,
  Clock,
  MapPin,
  Award,
} from 'lucide-react';
import type { Artist } from './ArtistCard';
import eventsData from '@/data/demo-events.json';

/* ---------- Props ---------- */
interface ArtistDetailProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ---------- Helpers ---------- */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

const ROLE_STYLES: Record<
  Artist['role'],
  { bg: string; text: string; border: string; label: string }
> = {
  resident: {
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    label: 'Resident Artist',
  },
  instructor: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    label: 'Instructor',
  },
  community: {
    bg: 'bg-slate-600/40',
    text: 'text-slate-300',
    border: 'border-slate-600/50',
    label: 'Community Member',
  },
};

/* ---------- Component ---------- */
export function ArtistDetail({ artist, isOpen, onClose }: ArtistDetailProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Mount portal on client only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
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

  // Don't render if not open or not mounted
  if (!mounted || !isOpen || !artist) return null;

  const role = ROLE_STYLES[artist.role];

  // Find upcoming workshops by this artist (match organizer field)
  const upcomingWorkshops = eventsData.filter(
    (ev) =>
      ev.organizer.toLowerCase() === artist.name.toLowerCase(),
  );

  const content = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
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
          {/* Hero gradient section */}
          <div
            className="relative h-48 flex items-end p-6"
            style={{
              background:
                'linear-gradient(135deg, #f43f5eCC 0%, #f43f5e44 60%, rgba(15,23,42,1) 100%)',
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

            {/* Large initials avatar */}
            <div className="relative z-10 flex items-end gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/30 border-2 border-rose-400/50 flex items-center justify-center shrink-0">
                <span className="text-rose-200 font-bold text-xl">
                  {getInitials(artist.name)}
                </span>
              </div>
              <div className="pb-1">
                <span
                  className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${role.bg} ${role.text} ${role.border} mb-1.5`}
                >
                  {role.label}
                </span>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {artist.name}
                </h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-8 -mt-2 relative z-10">
            {/* Medium tags */}
            {artist.medium.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {artist.medium.map((m) => (
                  <span
                    key={m}
                    className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-700 text-slate-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            {/* Bio */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {artist.bio}
              </p>
            </div>

            {/* Portfolio links */}
            {(artist.website || artist.instagram) && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Portfolio & Links
                </h3>
                <div className="space-y-2">
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:text-rose-400 hover:border-rose-500/50 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate">{artist.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  {artist.instagram && (
                    <a
                      href={`https://instagram.com/${artist.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:text-rose-400 hover:border-rose-500/50 transition-colors"
                    >
                      <Instagram className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate">@{artist.instagram}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Divider */}
            <hr className="border-slate-700 my-6" />

            {/* Upcoming workshops */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Upcoming Workshops
              </h3>
              {upcomingWorkshops.length > 0 ? (
                <div className="space-y-2">
                  {upcomingWorkshops.map((ev, idx) => (
                    <div
                      key={`${ev.name}-${ev.dateISO}-${idx}`}
                      className="px-3 py-3 rounded-lg bg-slate-800 border border-slate-700"
                    >
                      <p className="text-sm font-medium text-white leading-tight">
                        {ev.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-rose-400" />
                          {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-rose-400" />
                          {ev.startTime}
                          {ev.endTime ? ` - ${ev.endTime}` : ''}
                        </span>
                      </div>
                      {ev.address && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ev.address}</span>
                        </div>
                      )}
                      {ev.cost && ev.cost !== 'Free' && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-500/15 text-rose-400">
                          {ev.cost}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No upcoming workshops scheduled.
                </p>
              )}
            </div>

            {/* Divider */}
            <hr className="border-slate-700 my-6" />

            {/* Stats */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="px-3 py-3 rounded-lg bg-slate-800 border border-slate-700 text-center">
                  <p className="text-2xl font-bold text-white">
                    {artist.pastWorkshopCount}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Past Workshops
                  </p>
                </div>
                <div className="px-3 py-3 rounded-lg bg-slate-800 border border-slate-700 text-center">
                  <p className="text-2xl font-bold text-white">
                    {artist.upcomingWorkshopCount}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upcoming
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                <Award className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Member since {formatDate(artist.joinedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
