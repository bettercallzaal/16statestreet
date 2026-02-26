'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Calendar,
  Users,
  Building2,
  BarChart3,
  Lightbulb,
  Home,
  Menu,
  X,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/artists', label: 'Artists', icon: Users },
  { href: '/spaces', label: 'Spaces', icon: Building2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
];

export function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Branding */}
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-bold text-white leading-tight whitespace-nowrap">
              Heart of Ellsworth
            </span>
            <p className="text-[10px] sm:text-xs text-slate-500 leading-tight hidden sm:block">
              16 State Street
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-rose-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm px-4 py-2">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'text-rose-400 bg-rose-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
