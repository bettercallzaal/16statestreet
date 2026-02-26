'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ViewMode, ETHDenverEvent, RSVPData } from '@/lib/types';
import { useEvents } from '@/hooks/useEvents';
import { useFilters } from '@/hooks/useFilters';
import { applyFilters, getConferenceNow } from '@/lib/filters';
import { TYPE_TAGS, STORAGE_KEYS, HAS_MAPBOX, HAS_SUPABASE } from '@/lib/constants';
import { useItinerary } from '@/hooks/useItinerary';
import { usePOIs } from '@/hooks/usePOIs';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/hooks/useFriends';
import { useFriendsItineraries } from '@/hooks/useFriendsItineraries';
import { useCheckIns } from '@/hooks/useCheckIns';
import { useEventReactions } from '@/hooks/useEventReactions';
import { useEventCommentCounts } from '@/hooks/useEventCommentCounts';
import { useFriendLocations } from '@/hooks/useFriendLocations';
import { trackItinerary, trackAuthPrompt } from '@/lib/analytics';
import { Header } from './Header';
import { FilterBar } from './FilterBar';
import { ListView } from './ListView';
import { TableView } from './TableView';
import { MapViewWrapper } from './MapViewWrapper';
import { CalendarView } from './CalendarView';
import { CategoryGrid } from './CategoryGrid';
import { AnnouncementBanner } from './AnnouncementBanner';
import { EventDetail } from './EventDetail';
import { MyEvents } from './MyEvents';
import { CommunityFooter } from './CommunityFooter';
import { Loading } from './Loading';
import { AuthModal } from './AuthModal';
import { SubmitEventModal } from './SubmitEventModal';
import { FriendsPanel } from './FriendsPanel';

interface EventAppProps {
  showHomeLink?: boolean;
}

export function EventApp({ showHomeLink }: EventAppProps = {}) {
  const { events, loading, error } = useEvents();
  const {
    filters,
    setFilter,
    setConference,
    setDateTimeRange,
    toggleVibe,
    toggleFriend,
    toggleBool,
    toggleNowMode,
    clearFilters,
    activeFilterCount,
  } = useFilters();

  // Default to 'list' when no Mapbox token
  const [viewMode, setViewMode] = useState<ViewMode>(HAS_MAPBOX ? 'map' : 'list');
  const [viewRestored, setViewRestored] = useState(false);
  const [contentScrolled, setContentScrolled] = useState(false);

  // Restore view mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    if (saved === 'map' || saved === 'list' || saved === 'table' || saved === 'calendar') {
      // Don't restore map if no Mapbox token
      if (saved === 'map' && !HAS_MAPBOX) {
        setViewMode('list');
      } else {
        setViewMode(saved);
      }
    }
    setViewRestored(true);
  }, []);

  useEffect(() => {
    if (viewRestored) {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    }
  }, [viewMode, viewRestored]);

  // List view scroll tracking
  const listMainRef = useRef<HTMLDivElement>(null);
  const listLastScrollTopRef = useRef(0);
  const listScrolledRef = useRef(false);

  const handleListScroll = useCallback(() => {
    const container = listMainRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const atTop = scrollTop <= 5;
    const scrollingDown = scrollTop > listLastScrollTopRef.current + 2;
    const scrollingUp = scrollTop < listLastScrollTopRef.current - 2;
    listLastScrollTopRef.current = scrollTop;

    const overflowAmount = container.scrollHeight - container.clientHeight;
    const nearBottom = scrollTop + container.clientHeight >= container.scrollHeight - 50;
    const shouldHide = !atTop && !nearBottom && scrollingDown && overflowAmount > 80;
    const shouldShow = atTop || scrollingUp;

    if (shouldHide && !listScrolledRef.current) {
      listScrolledRef.current = true;
      setContentScrolled(true);
    } else if (shouldShow && listScrolledRef.current) {
      listScrolledRef.current = false;
      setContentScrolled(false);
    }
  }, []);

  const { user } = useAuth();

  const {
    itinerary,
    toggle: toggleItinerary,
    count: itineraryCount,
    ready: itineraryReady,
  } = useItinerary();

  const { pois, addPOI, removePOI, updatePOI, ownerNames } = usePOIs();

  const { friends, removeFriend, refreshFriends } = useFriends();
  const { friendItineraries } = useFriendsItineraries(friends);
  const { checkInCounts, checkInUsersByEvent } = useCheckIns(friends);
  const { reactionsByEvent, toggleReaction } = useEventReactions();
  const commentCounts = useEventCommentCounts();
  const friendLocations = useFriendLocations(friends);

  // RSVP state — persisted to localStorage
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RSVPS);
      if (saved) setRsvps(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (rsvps.length > 0) {
      localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvps));
    }
  }, [rsvps]);

  const handleRSVP = useCallback((rsvp: RSVPData) => {
    setRsvps((prev) => [...prev.filter((r) => r.eventId !== rsvp.eventId), rsvp]);
  }, []);

  const handleCancelRSVP = useCallback((eventId: string) => {
    setRsvps((prev) => prev.filter((r) => r.eventId !== eventId));
  }, []);

  const rsvpEventIds = useMemo(() => new Set(rsvps.map((r) => r.eventId)), [rsvps]);

  // Event detail modal
  const [selectedEvent, setSelectedEvent] = useState<ETHDenverEvent | null>(null);

  // My Events panel
  const [showMyEvents, setShowMyEvents] = useState(false);

  // Category filter
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Quick filter
  const [quickFilter, setQuickFilter] = useState<string | null>(null);

  // Auth-gated reaction toggle
  const handleToggleReaction = useCallback(
    (eventId: string, emoji: import('@/lib/types').ReactionEmoji) => {
      if (user) {
        toggleReaction(eventId, emoji);
      } else if (HAS_SUPABASE) {
        trackAuthPrompt('reaction');
        setShowAuthForStar(true);
      }
    },
    [user, toggleReaction]
  );

  // Friends panel
  const [showFriends, setShowFriends] = useState(false);
  const [showSubmitEvent, setShowSubmitEvent] = useState(false);

  // Auth-gated starring
  const [showAuthForStar, setShowAuthForStar] = useState(false);
  const pendingStarRef = useRef<string | null>(null);

  const handleItineraryToggle = useCallback(
    (eventId: string) => {
      if (user || !HAS_SUPABASE) {
        const action = itinerary.has(eventId) ? 'remove' : 'add';
        trackItinerary(eventId, action);
        toggleItinerary(eventId);
      } else {
        trackAuthPrompt('star');
        pendingStarRef.current = eventId;
        setShowAuthForStar(true);
      }
    },
    [user, toggleItinerary, itinerary]
  );

  // Complete pending star after login
  useEffect(() => {
    if (user && itineraryReady && pendingStarRef.current) {
      toggleItinerary(pendingStarRef.current);
      pendingStarRef.current = null;
      setShowAuthForStar(false);
    }
  }, [user, itineraryReady, toggleItinerary]);

  useEffect(() => {
    if (!user && filters.itineraryOnly) {
      setFilter('itineraryOnly', false);
    }
  }, [user, filters.itineraryOnly, setFilter]);

  // Auto-refresh for "Now" mode
  const [nowTick, setNowTick] = useState(0);
  useEffect(() => {
    if (!filters.nowMode) return;
    const interval = setInterval(() => {
      setNowTick((t) => t + 1);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [filters.nowMode]);

  const availableConferences = useMemo(
    () => [...new Set(events.map((e) => e.conference).filter(Boolean))],
    [events]
  );

  const availableTypes = useMemo(
    () => {
      const present = new Set(events.flatMap((e) => e.tags).filter(Boolean));
      return TYPE_TAGS.filter((t) => present.has(t));
    },
    [events]
  );

  const availableVibes = useMemo(
    () =>
      [...new Set(events.flatMap((e) => e.tags).filter(Boolean))]
        .filter((t) => !TYPE_TAGS.includes(t))
        .sort(),
    [events]
  );

  const conferenceEventCount = useMemo(
    () => events.filter((e) => !filters.conference || e.conference === filters.conference).length,
    [events, filters.conference]
  );

  const conferenceItineraryCount = useMemo(
    () => events.filter((e) => itinerary.has(e.id) && (!filters.conference || e.conference === filters.conference)).length,
    [events, itinerary, filters.conference]
  );

  const conferenceEventIds = useMemo(() => {
    const ids = new Set<string>();
    for (const e of events) {
      if (!filters.conference || e.conference === filters.conference) {
        ids.add(e.id);
      }
    }
    return ids;
  }, [events, filters.conference]);

  const friendsForFilter = useMemo(
    () =>
      friendItineraries
        .filter((fi) => {
          for (const eid of fi.eventIds) {
            if (conferenceEventIds.has(eid)) return true;
          }
          return false;
        })
        .map((fi) => ({ userId: fi.userId, displayName: fi.displayName })),
    [friendItineraries, conferenceEventIds]
  );

  const selectedFriendEventIds = useMemo(() => {
    if (filters.selectedFriends.length === 0) return undefined;
    const ids = new Set<string>();
    for (const fi of friendItineraries) {
      if (filters.selectedFriends.includes(fi.userId)) {
        for (const eid of fi.eventIds) {
          ids.add(eid);
        }
      }
    }
    return ids;
  }, [filters.selectedFriends, friendItineraries]);

  useEffect(() => {
    if (filters.selectedFriends.length === 0) return;
    const friendIds = new Set(friends.map((f) => f.user_id));
    const stale = filters.selectedFriends.filter((id) => !friendIds.has(id));
    if (stale.length > 0) {
      setFilter('selectedFriends', filters.selectedFriends.filter((id) => friendIds.has(id)));
    }
  }, [friends, filters.selectedFriends, setFilter]);

  const friendsCountByEvent = useMemo(() => {
    const counts = new Map<string, number>();
    for (const fi of friendItineraries) {
      for (const eid of fi.eventIds) {
        counts.set(eid, (counts.get(eid) ?? 0) + 1);
      }
    }
    return counts;
  }, [friendItineraries]);

  const friendsByEvent = useMemo(() => {
    const map = new Map<string, { userId: string; displayName: string }[]>();
    for (const fi of friendItineraries) {
      for (const eid of fi.eventIds) {
        if (!map.has(eid)) map.set(eid, []);
        map.get(eid)!.push({ userId: fi.userId, displayName: fi.displayName });
      }
    }
    return map;
  }, [friendItineraries]);

  const checkedInFriendsByEvent = useMemo(() => {
    const friendMap = new Map(friends.map((f) => [f.user_id, f]));
    const map = new Map<string, { userId: string; displayName: string }[]>();
    for (const [eid, userIds] of checkInUsersByEvent) {
      const friendInfos: { userId: string; displayName: string }[] = [];
      for (const uid of userIds) {
        const friend = friendMap.get(uid);
        if (friend) {
          friendInfos.push({
            userId: uid,
            displayName: friend.display_name || (friend.x_handle ? `@${friend.x_handle}` : null) || friend.email || uid.slice(0, 8),
          });
        }
      }
      if (friendInfos.length > 0) map.set(eid, friendInfos);
    }
    return map;
  }, [checkInUsersByEvent, friends]);

  // Apply quick filter
  const quickFilteredEvents = useMemo(() => {
    if (!quickFilter) return events;

    const now = new Date();
    const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (quickFilter === 'today') {
      return events.filter((e) => e.dateISO === todayISO);
    }

    if (quickFilter === 'this-week') {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const startISO = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
      const endISO = `${endOfWeek.getFullYear()}-${String(endOfWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfWeek.getDate()).padStart(2, '0')}`;
      return events.filter((e) => e.dateISO >= startISO && e.dateISO <= endISO);
    }

    if (quickFilter === 'this-weekend') {
      const dayOfWeek = now.getDay();
      const daysToSat = (6 - dayOfWeek + 7) % 7;
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + (daysToSat === 0 && dayOfWeek === 6 ? 0 : daysToSat));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      const satISO = `${saturday.getFullYear()}-${String(saturday.getMonth() + 1).padStart(2, '0')}-${String(saturday.getDate()).padStart(2, '0')}`;
      const sunISO = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
      // If today is Sunday, include today too
      if (dayOfWeek === 0) {
        return events.filter((e) => e.dateISO === todayISO);
      }
      return events.filter((e) => e.dateISO === satISO || e.dateISO === sunISO);
    }

    if (quickFilter === 'this-month') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return events.filter((e) => e.dateISO.startsWith(monthPrefix));
    }

    if (quickFilter === 'next-week') {
      const dayOfWeek = now.getDay();
      const startOfNextWeek = new Date(now);
      startOfNextWeek.setDate(now.getDate() + (7 - dayOfWeek));
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
      const startISO = `${startOfNextWeek.getFullYear()}-${String(startOfNextWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfNextWeek.getDate()).padStart(2, '0')}`;
      const endISO = `${endOfNextWeek.getFullYear()}-${String(endOfNextWeek.getMonth() + 1).padStart(2, '0')}-${String(endOfNextWeek.getDate()).padStart(2, '0')}`;
      return events.filter((e) => e.dateISO >= startISO && e.dateISO <= endISO);
    }

    if (quickFilter === 'free') {
      return events.filter((e) => e.isFree || e.cost === 'Free' || e.cost === '' || !e.cost);
    }

    return events;
  }, [events, quickFilter]);

  // Apply category filter on top of quick filter
  const categoryFilteredEvents = useMemo(() => {
    if (!activeCategory) return quickFilteredEvents;
    return quickFilteredEvents.filter((e) => e.tags.includes(activeCategory));
  }, [quickFilteredEvents, activeCategory]);

  const filteredEvents = useMemo(
    () => applyFilters(categoryFilteredEvents, filters, itinerary, filters.nowMode ? getConferenceNow(filters.conference).getTime() : undefined, selectedFriendEventIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [categoryFilteredEvents, filters, itinerary, nowTick, selectedFriendEventIds]
  );

  const handleEventClick = useCallback((event: ETHDenverEvent) => {
    setSelectedEvent(event);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header
          viewMode={viewMode}
          onViewChange={setViewMode}
          itineraryCount={0}
          onItineraryToggle={() => toggleBool('itineraryOnly')}
          isItineraryActive={filters.itineraryOnly}
          events={events}
          itinerary={itinerary}
          onOpenFriends={() => setShowFriends(true)}
          refreshFriends={refreshFriends}
          showHomeLink={showHomeLink}
        />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header
          viewMode={viewMode}
          onViewChange={setViewMode}
          itineraryCount={0}
          onItineraryToggle={() => toggleBool('itineraryOnly')}
          isItineraryActive={filters.itineraryOnly}
          events={events}
          itinerary={itinerary}
          onOpenFriends={() => setShowFriends(true)}
          refreshFriends={refreshFriends}
          showHomeLink={showHomeLink}
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-4">
          <div className="text-red-400 text-lg font-medium">Failed to load events</div>
          <p className="text-slate-500 text-sm text-center max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-slate-900 overflow-hidden">
      <Header
        viewMode={viewMode}
        onViewChange={setViewMode}
        itineraryCount={conferenceItineraryCount}
        onItineraryToggle={() => toggleBool('itineraryOnly')}
        isItineraryActive={filters.itineraryOnly}
        events={events}
        itinerary={itinerary}
        onOpenFriends={() => setShowFriends(true)}
        onSubmitEvent={() => setShowSubmitEvent(true)}
        refreshFriends={refreshFriends}
        onOpenMyEvents={() => setShowMyEvents(true)}
        myEventsCount={rsvps.length}
        showHomeLink={showHomeLink}
      />

      <AnnouncementBanner events={events} onEventClick={handleEventClick} />

      {/* Filter bar — collapses on scroll */}
      <div className={
        viewMode === 'table' || viewMode === 'list'
          ? `shrink-0 transition-all duration-200 ${contentScrolled ? 'lg:overflow-visible lg:max-h-none overflow-hidden max-h-0' : ''}`
          : 'shrink-0'
      }>
        <FilterBar
          filters={filters}
          onSetConference={setConference}
          onSetDateTimeRange={setDateTimeRange}
          onToggleVibe={toggleVibe}
          onToggleNowMode={toggleNowMode}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
          availableConferences={availableConferences}
          availableTypes={availableTypes}
          availableVibes={availableVibes}
          friendsForFilter={friendsForFilter}
          selectedFriends={filters.selectedFriends}
          onToggleFriend={toggleFriend}
          searchQuery={filters.searchQuery}
          onSearchChange={(query) => setFilter('searchQuery', query)}
          eventCount={filteredEvents.length}
          quickFilter={quickFilter}
          onQuickFilter={setQuickFilter}
          activeCategory={activeCategory}
          onCategorySelect={setActiveCategory}
        />
      </div>

      {/* Main content area */}
      {viewMode === 'map' ? (
        <main className="flex-1 min-h-0">
          <MapViewWrapper
            events={filteredEvents}
            itinerary={itinerary}
            onItineraryToggle={handleItineraryToggle}
            isItineraryView={filters.itineraryOnly}
            friendsCountByEvent={friendsCountByEvent}
            friendsByEvent={friendsByEvent}
            checkedInFriendsByEvent={checkedInFriendsByEvent}
            checkInCounts={checkInCounts}
            reactionsByEvent={reactionsByEvent}
            onToggleReaction={handleToggleReaction}
            commentCounts={commentCounts}
            friendLocations={friendLocations}
            conference={filters.conference}
            pois={pois}
            onAddPOI={addPOI}
            onRemovePOI={removePOI}
            onUpdatePOI={updatePOI}
            ownerNames={ownerNames}
          />
        </main>
      ) : viewMode === 'calendar' ? (
        <main className="flex-1 min-h-0 overflow-y-auto">
          <CalendarView
            events={filteredEvents}
            itinerary={itinerary}
            onItineraryToggle={handleItineraryToggle}
            onEventClick={handleEventClick}
          />
        </main>
      ) : viewMode === 'table' ? (
        <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <TableView
            events={filteredEvents}
            totalCount={conferenceEventCount}
            itinerary={itinerary}
            onItineraryToggle={handleItineraryToggle}
            onScrolledChange={setContentScrolled}
            friendsCountByEvent={friendsCountByEvent}
            friendsByEvent={friendsByEvent}
            checkedInFriendsByEvent={checkedInFriendsByEvent}
            checkInCounts={checkInCounts}
            reactionsByEvent={reactionsByEvent}
            onToggleReaction={handleToggleReaction}
            commentCounts={commentCounts}
          />
        </main>
      ) : (
        <main ref={listMainRef} onScroll={handleListScroll} className="flex-1 min-h-0 overflow-y-auto">
          {/* Category grid at top of list view */}
          <CategoryGrid
            events={events}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
          />

          <ListView
            events={filteredEvents}
            totalCount={conferenceEventCount}
            itinerary={itinerary}
            onItineraryToggle={handleItineraryToggle}
            friendsCountByEvent={friendsCountByEvent}
            friendsByEvent={friendsByEvent}
            checkedInFriendsByEvent={checkedInFriendsByEvent}
            checkInCounts={checkInCounts}
            reactionsByEvent={reactionsByEvent}
            onToggleReaction={handleToggleReaction}
            commentCounts={commentCounts}
            rsvpEventIds={rsvpEventIds}
            onEventClick={handleEventClick}
          />

          <CommunityFooter />
        </main>
      )}

      {/* Modals and panels */}
      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
          rsvps={rsvps}
          onRSVP={handleRSVP}
          onCancelRSVP={handleCancelRSVP}
        />
      )}

      <MyEvents
        isOpen={showMyEvents}
        onClose={() => setShowMyEvents(false)}
        rsvps={rsvps}
        events={events}
        onCancelRSVP={handleCancelRSVP}
        onEventClick={(event) => { setShowMyEvents(false); setSelectedEvent(event); }}
      />

      <AuthModal isOpen={showAuthForStar} onClose={() => { pendingStarRef.current = null; setShowAuthForStar(false); }} />
      <SubmitEventModal isOpen={showSubmitEvent} onClose={() => setShowSubmitEvent(false)} />
      <FriendsPanel
        isOpen={showFriends}
        onClose={() => setShowFriends(false)}
        friends={friends}
        onRemoveFriend={removeFriend}
      />
    </div>
  );
}
