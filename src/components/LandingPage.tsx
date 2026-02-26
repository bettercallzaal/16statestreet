'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Heart,
  Calendar,
  Users,
  Building2,
  BarChart3,
  Lightbulb,
  ArrowRight,
  MapPin,
  Clock,
  Palette,
} from 'lucide-react';
import { NavBar } from './NavBar';
import { CommunityFooter } from './CommunityFooter';
import demoEvents from '@/data/demo-events.json';
import demoArtists from '@/data/demo-artists.json';
import demoSpaces from '@/data/demo-spaces.json';

const QUICK_LINKS = [
  {
    href: '/events',
    label: 'Events',
    description: 'Browse workshops, open studios & community happenings',
    icon: Calendar,
    color: 'text-rose-400',
  },
  {
    href: '/artists',
    label: 'Artists & Makers',
    description: 'Meet resident artists, instructors & community makers',
    icon: Users,
    color: 'text-blue-400',
  },
  {
    href: '/spaces',
    label: 'Book a Space',
    description: 'Reserve studios, check out equipment & plan your project',
    icon: Building2,
    color: 'text-purple-400',
  },
  {
    href: '/ideas',
    label: 'Submit an Idea',
    description: 'Propose workshops, improvements & community partnerships',
    icon: Lightbulb,
    color: 'text-amber-400',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    description: 'Attendance, utilization & community engagement data',
    icon: BarChart3,
    color: 'text-emerald-400',
  },
  {
    href: '/events',
    label: 'About 16 State St',
    description: "Ellsworth's creative hub for arts, making & gathering",
    icon: MapPin,
    color: 'text-cyan-400',
  },
];

export function LandingPage() {
  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return demoEvents
      .filter((e) => e.dateISO >= today)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.startTime.localeCompare(b.startTime))
      .slice(0, 3);
  }, []);

  const featuredArtist = useMemo(() => {
    const idx = Math.floor(Math.random() * demoArtists.length);
    return demoArtists[idx];
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const eventsThisMonth = demoEvents.filter((e) => e.dateISO.startsWith(monthPrefix)).length;
    return {
      artists: demoArtists.length,
      eventsThisMonth,
      studios: demoSpaces.spaces.length,
      members: 47,
    };
  }, []);

  const roleColor = (role: string) => {
    if (role === 'resident') return 'bg-rose-500/20 text-rose-400';
    if (role === 'instructor') return 'bg-blue-500/20 text-blue-400';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="min-h-dvh flex flex-col bg-slate-900">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500/20 via-slate-900 to-slate-900" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            16 State Street
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-xl mx-auto">
            Ellsworth&apos;s Creative Makerspace &amp; Community Hub
          </p>
        </div>
      </section>

      {/* Stats row */}
      <section className="max-w-4xl mx-auto px-4 -mt-6 relative z-10 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Artists', value: stats.artists, icon: Palette },
            { label: 'Events This Month', value: stats.eventsThisMonth, icon: Calendar },
            { label: 'Studios', value: stats.studios, icon: Building2 },
            { label: 'Members', value: stats.members, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"
            >
              <Icon className="w-5 h-5 text-slate-500 mx-auto mb-1" />
              <div className="text-3xl font-bold text-rose-500">{value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What's Happening */}
      <section className="max-w-4xl mx-auto px-4 mt-12 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">What&apos;s Happening</h2>
          <Link
            href="/events"
            className="flex items-center gap-1 text-sm text-rose-400 hover:text-rose-300 transition-colors"
          >
            All events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {upcomingEvents.map((event, i) => (
            <Link
              key={i}
              href="/events"
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-rose-500/50 transition-colors group"
            >
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{event.date} &middot; {event.startTime}</span>
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors leading-snug">
                {event.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{event.organizer}</p>
              {event.cost && event.cost !== 'Free' && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                  {event.cost}
                </span>
              )}
              {event.cost === 'Free' && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  Free
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Artist */}
      <section className="max-w-4xl mx-auto px-4 mt-12 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Featured Artist</h2>
          <Link
            href="/artists"
            className="flex items-center gap-1 text-sm text-rose-400 hover:text-rose-300 transition-colors"
          >
            All artists <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <Link
          href="/artists"
          className="flex items-start gap-4 bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-rose-500/50 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-lg shrink-0">
            {featuredArtist.name
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-white">
                {featuredArtist.name}
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColor(featuredArtist.role)}`}
              >
                {featuredArtist.role}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {featuredArtist.medium.map((m) => (
                <span
                  key={m}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300"
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-2 line-clamp-2">
              {featuredArtist.bio}
            </p>
          </div>
        </Link>
      </section>

      {/* Quick Links */}
      <section className="max-w-4xl mx-auto px-4 mt-12 mb-16 w-full">
        <h2 className="text-xl font-bold text-white mb-4">Explore</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ href, label, description, icon: Icon, color }) => (
            <Link
              key={label}
              href={href}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-rose-500/50 transition-colors group"
            >
              <Icon className={`w-6 h-6 ${color} mb-2`} />
              <h3 className="text-sm font-semibold text-white group-hover:text-rose-400 transition-colors">
                {label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <CommunityFooter />
    </div>
  );
}
