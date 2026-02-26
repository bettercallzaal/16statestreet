'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ChevronUp, ChevronDown, MapPinOff, MapPin } from 'lucide-react';
import type { ETHDenverEvent, POI, POICategory, ReactionEmoji, FriendLocation } from '@/lib/types';
import { HAS_MAPBOX } from '@/lib/constants';
import { EventCard } from './EventCard';

const MapView = dynamic(
  () => import('./MapView').then((mod) => ({ default: mod.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading map...</div>
      </div>
    ),
  }
);

interface MapViewWrapperProps {
  events: ETHDenverEvent[];
  onEventSelect?: (event: ETHDenverEvent) => void;
  itinerary?: Set<string>;
  onItineraryToggle?: (eventId: string) => void;
  isItineraryView?: boolean;
  friendsCountByEvent?: Map<string, number>;
  friendsByEvent?: Map<string, { userId: string; displayName: string }[]>;
  checkedInFriendsByEvent?: Map<string, { userId: string; displayName: string }[]>;
  checkInCounts?: Map<string, number>;
  reactionsByEvent?: Map<string, { emoji: ReactionEmoji; count: number; reacted: boolean }[]>;
  onToggleReaction?: (eventId: string, emoji: ReactionEmoji) => void;
  commentCounts?: Map<string, number>;
  friendLocations?: FriendLocation[];
  conference?: string;
  pois?: POI[];
  onAddPOI?: (poi: { name: string; lat: number; lng: number; address?: string | null; category: POICategory; note?: string | null }) => Promise<unknown>;
  onRemovePOI?: (id: string) => void;
  onUpdatePOI?: (id: string, updates: Partial<Pick<POI, 'name' | 'category' | 'note' | 'is_public'>>) => void;
  ownerNames?: Map<string, string>;
}

/** Fallback when no Mapbox token is available */
function MapPlaceholder({ events }: { events: ETHDenverEvent[] }) {
  const locations = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of events) {
      if (e.address) {
        map.set(e.address, (map.get(e.address) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [events]);

  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
          <MapPin className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">Map View</h3>
          <p className="text-slate-400 text-sm mt-1">
            Map view is available when a Mapbox token is configured.
          </p>
        </div>
        {locations.length > 0 && (
          <div className="text-left space-y-2 pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
              Event Locations
            </p>
            {locations.map(([address, count]) => (
              <div key={address} className="flex items-start gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                <span className="text-slate-300 flex-1 min-w-0 truncate">{address}</span>
                <span className="text-slate-500 text-xs shrink-0">{count} events</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MapViewWrapper({
  events,
  onEventSelect,
  itinerary,
  onItineraryToggle,
  isItineraryView,
  friendsCountByEvent,
  friendsByEvent,
  checkedInFriendsByEvent,
  checkInCounts,
  reactionsByEvent,
  onToggleReaction,
  commentCounts,
  friendLocations,
  conference,
  pois,
  onAddPOI,
  onRemovePOI,
  onUpdatePOI,
  ownerNames,
}: MapViewWrapperProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const noLocationEvents = useMemo(
    () => events.filter((e) => e.lat == null || e.lng == null),
    [events]
  );

  const count = noLocationEvents.length;

  // If no Mapbox token, show placeholder
  if (!HAS_MAPBOX) {
    return <MapPlaceholder events={events} />;
  }

  return (
    <div className="w-full h-full overflow-hidden relative">
      <MapView
        events={events}
        onEventSelect={onEventSelect}
        itinerary={itinerary}
        onItineraryToggle={onItineraryToggle}
        isItineraryView={isItineraryView}
        friendsCountByEvent={friendsCountByEvent}
        friendsByEvent={friendsByEvent}
        checkedInFriendsByEvent={checkedInFriendsByEvent}
        checkInCounts={checkInCounts}
        reactionsByEvent={reactionsByEvent}
        onToggleReaction={onToggleReaction}
        friendLocations={friendLocations}
        conference={conference}
        pois={pois}
        onAddPOI={onAddPOI}
        onRemovePOI={onRemovePOI}
        onUpdatePOI={onUpdatePOI}
        ownerNames={ownerNames}
      />

      {/* No-location drawer */}
      {count > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col pointer-events-none">
          {drawerOpen && (
            <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 max-h-[45vh] overflow-y-auto">
              <div className="max-w-3xl mx-auto px-3 py-2 space-y-2">
                {noLocationEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isInItinerary={itinerary?.has(event.id) ?? false}
                    onItineraryToggle={onItineraryToggle}
                    friendsCount={friendsCountByEvent?.get(event.id)}
                    friendsGoing={friendsByEvent?.get(event.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="pointer-events-auto self-center mb-2 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-full text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shadow-lg"
          >
            <MapPinOff className="w-3.5 h-3.5" />
            {count} without location
            {drawerOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      )}
    </div>
  );
}
