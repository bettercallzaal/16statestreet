export const SHEET_ID = '1xWmIHyEyOmPHfkYuZkucPRlLGWbb9CF6Oqvfl8FUV6k';

export const EVENT_TABS = [
  {
    gid: 0,
    name: 'Ellsworth',
    timezone: 'America/New_York',
    dates: (() => {
      // Generate dates for the next 5 weeks from today
      const dates: string[] = [];
      const start = new Date();
      for (let i = 0; i < 35; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
      return dates;
    })(),
    center: { lat: 44.5435, lng: -68.4195 },
  },
];

export const DEFAULT_TAB = EVENT_TABS[0];

/** Get tab config by conference name */
export function getTabConfig(conference: string) {
  return EVENT_TABS.find((t) => t.name === conference) ?? DEFAULT_TAB;
}

/** @deprecated Use getTabConfig(conference).timezone */
export const CONFERENCE_TIMEZONE = DEFAULT_TAB.timezone;

/** @deprecated Use getTabConfig(conference).dates */
export const EVENT_DATES = DEFAULT_TAB.dates;

/** @deprecated Use getTabConfig(conference).center */
export const DENVER_CENTER = DEFAULT_TAB.center;

export const VIBE_COLORS: Record<string, string> = {
  // Green group — event formats
  'Workshop': '#34D399',
  'Open Studio': '#34D399',
  'Market': '#34D399',
  'Meetup': '#34D399',
  'Performance': '#34D399',
  'Film': '#34D399',
  'Wellness': '#34D399',
  // Blue group — space & business
  'Makerspace': '#3B82F6',
  'Coworking': '#3B82F6',
  'Business': '#3B82F6',
  // Yellow group — topics & interests
  'Arts': '#FBBF24',
  'Music': '#FBBF24',
  'Food': '#FBBF24',
  'Outdoors': '#FBBF24',
  'Kids/Family': '#FBBF24',
  // Purple — paid
  '$$': '#A855F7',
  'default': '#6B7280',
};

/** Tags that describe event format/type (vs topic/interest tags) */
export const TYPE_TAGS = [
  '$$',
  'Workshop',
  'Open Studio',
  'Market',
  'Meetup',
  'Performance',
  'Film',
  'Wellness',
  'Makerspace',
  'Coworking',
  'Business',
];

export const STORAGE_KEYS = {
  ITINERARY: 'ellsworth-itinerary',
  ITINERARY_UPDATED: 'ellsworth-itinerary-updated',
  VIEW_MODE: 'ellsworth-view',
  RSVPS: 'ellsworth-rsvps',
  BOOKINGS: 'ellsworth-bookings',
  IDEAS: 'ellsworth-ideas',
  IDEA_VOTES: 'ellsworth-idea-votes',
  EQUIPMENT: 'ellsworth-equipment',
};

export const TIME_RANGES = {
  morning: { start: 6, end: 12, label: 'Morning' },
  afternoon: { start: 12, end: 17, label: 'Afternoon' },
  evening: { start: 17, end: 21, label: 'Evening' },
  night: { start: 21, end: 6, label: 'Night' },
};

export const POI_CATEGORIES = [
  { value: 'pin', label: 'Pin', icon: 'MapPin', color: '#94A3B8' },
  { value: 'library', label: 'Library', icon: 'BookOpen', color: '#60A5FA' },
  { value: 'park', label: 'Park', icon: 'Trees', color: '#34D399' },
  { value: 'food', label: 'Restaurant', icon: 'Utensils', color: '#FB923C' },
  { value: 'shop', label: 'Shop', icon: 'Store', color: '#A855F7' },
  { value: 'work', label: 'Work', icon: 'Laptop', color: '#FBBF24' },
] as const;

export const MAX_POIS = 20;

export const REACTION_EMOJIS = ['🔥', '❤️', '💯', '👍', '🎉', '👀'] as const;

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
export const HAS_MAPBOX = !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
export const HAS_SUPABASE = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
