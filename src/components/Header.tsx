'use client';

import { useState } from 'react';
import { Calendar, User, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { trackAuthPrompt } from '@/lib/analytics';
import { ViewMode, ETHDenverEvent } from '@/lib/types';
import { HAS_SUPABASE } from '@/lib/constants';
import { ViewToggle } from './ViewToggle';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal, UserMenu } from './AuthModal';

interface HeaderProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  itineraryCount: number;
  onItineraryToggle: () => void;
  isItineraryActive: boolean;
  events: ETHDenverEvent[];
  itinerary: Set<string>;
  onOpenFriends: () => void;
  onSubmitEvent?: () => void;
  refreshFriends?: () => Promise<void>;
  onOpenMyEvents?: () => void;
  myEventsCount?: number;
  showHomeLink?: boolean;
}

export function Header({
  viewMode,
  onViewChange,
  itineraryCount,
  onItineraryToggle,
  isItineraryActive,
  events,
  itinerary,
  onOpenFriends,
  onSubmitEvent,
  refreshFriends,
  onOpenMyEvents,
  myEventsCount = 0,
  showHomeLink,
}: HeaderProps) {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="sticky top-0 shrink-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: Branding */}
          <div className="flex items-center gap-2 min-w-0">
            {showHomeLink && (
              <Link href="/" className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors mr-1">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Home</span>
              </Link>
            )}
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight whitespace-nowrap">
                Heart of Ellsworth
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-tight hidden sm:block">
                Community Events
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />

            {/* My Events button */}
            {onOpenMyEvents && (
              <button
                onClick={onOpenMyEvents}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                  myEventsCount > 0
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
                aria-label={`My Events: ${myEventsCount} registered`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">My Events</span>
                {myEventsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 bg-rose-500 text-white">
                    {myEventsCount}
                  </span>
                )}
              </button>
            )}

            {/* Itinerary filter toggle */}
            <button
              onClick={() => {
                if (!HAS_SUPABASE && !user) {
                  // In demo mode, toggle itinerary without auth
                  onItineraryToggle();
                  return;
                }
                if (!user) {
                  trackAuthPrompt('itinerary_button');
                  setShowAuth(true);
                  return;
                }
                onItineraryToggle();
              }}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                isItineraryActive
                  ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
              aria-label={`Saved: ${itineraryCount} events`}
            >
              <span className="text-sm">&#9733;</span>
              {itineraryCount > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 ${
                  isItineraryActive
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-rose-500 text-white'
                }`}>
                  {itineraryCount}
                </span>
              )}
            </button>

            {/* Auth / Profile */}
            {HAS_SUPABASE && !loading && (
              user ? (
                <UserMenu events={events} itinerary={itinerary} onOpenFriends={onOpenFriends} onSubmitEvent={onSubmitEvent} externalRefreshFriends={refreshFriends} />
              ) : (
                <button
                  onClick={() => { trackAuthPrompt('sign_in_button'); setShowAuth(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors text-sm cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
