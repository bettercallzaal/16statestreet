import { ETHDenverEvent } from './types';
import { DEMO_MODE } from './constants';

/**
 * Generate a stable, deterministic event ID from event properties.
 */
export function generateEventId(conference: string, date: string, startTime: string, name: string): string {
  const input = `${conference}|${date}|${startTime}|${name}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const positiveHash = (hash >>> 0).toString(36);
  return `evt-${positiveHash}`;
}

function getTimeOfDay(timeStr: string): 'morning' | 'afternoon' | 'evening' | 'night' | 'all-day' {
  if (!timeStr) return 'all-day';
  const normalized = timeStr.toLowerCase().trim();
  if (normalized === 'all day' || normalized === 'tbd') return 'all-day';
  const match = normalized.match(/(\d{1,2}):?(\d{2})?\s*(am?|pm?)?/i);
  if (!match) return 'all-day';
  let hour = parseInt(match[1]);
  const isPM = match[3] && match[3].startsWith('p');
  const isAM = match[3] && match[3].startsWith('a');
  if (isPM && hour !== 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function isFreeEvent(cost: string): boolean {
  if (!cost) return true;
  const lower = cost.toLowerCase().trim();
  return lower === 'free' || lower === '' || lower === '0' || lower === '$0';
}

async function fetchDemoEvents(): Promise<ETHDenverEvent[]> {
  const { default: demoData } = await import('@/data/demo-events.json');
  const events: ETHDenverEvent[] = (demoData as Array<Record<string, unknown>>).map((raw) => {
    const name = raw.name as string;
    const date = raw.date as string;
    const startTime = raw.startTime as string;
    const cost = (raw.cost as string) || '';
    const tags = (raw.tags as string[]) || [];
    const isAllDay = (raw.isAllDay as boolean) || false;

    return {
      id: generateEventId('Ellsworth', date, startTime, name),
      date,
      dateISO: raw.dateISO as string,
      startTime: isAllDay ? 'All Day' : startTime,
      endTime: (raw.endTime as string) || '',
      isAllDay,
      organizer: (raw.organizer as string) || '',
      name,
      address: (raw.address as string) || '',
      cost,
      isFree: isFreeEvent(cost),
      vibe: tags[0] || '',
      tags,
      conference: 'Ellsworth',
      link: (raw.link as string) || '',
      hasFood: (raw.hasFood as boolean) || false,
      hasBar: (raw.hasBar as boolean) || false,
      note: (raw.note as string) || '',
      lat: raw.lat as number | undefined,
      lng: raw.lng as number | undefined,
      timeOfDay: isAllDay ? 'all-day' : getTimeOfDay(startTime),
      description: (raw.description as string) || '',
      capacity: raw.capacity as number | undefined,
      registeredCount: raw.registeredCount as number | undefined,
    };
  });
  return events;
}

export async function fetchEvents(): Promise<ETHDenverEvent[]> {
  // In demo mode or when no Google Sheets config is available, use local demo data
  if (DEMO_MODE) {
    return fetchDemoEvents();
  }

  // Try fetching from Google Sheets, fall back to demo data on failure
  try {
    const { parseGVizResponse, getCellValue, getCellBool } = await import('./gviz');
    const { SHEET_ID, EVENT_TABS } = await import('./constants');
    const { parseDateToISO, getTimeOfDay: getTimeOfDayUtil, isFreeEvent: isFreeUtil, normalizeAddress } = await import('./utils');
    const { default: geocodedData } = await import('@/data/geocoded-addresses.json');

    const TAG_ALIASES: Record<string, string> = {
      'Fitness/Wellness': 'Wellness',
    };

    function parseTags(raw: string): string[] {
      if (!raw) return [];
      return raw.split(',').map((t) => t.trim()).filter(Boolean).map((t) => TAG_ALIASES[t] || t);
    }

    const events: ETHDenverEvent[] = [];
    const seenIds = new Map<string, number>();

    for (const tab of EVENT_TABS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let allRows: any[] = [];

      for (let offset = 0; offset < 5000; offset += 500) {
        const tq = encodeURIComponent(`select * limit 500 offset ${offset}`);
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${tab.gid}&headers=1&tq=${tq}`;
        const response = await fetch(url);
        const text = await response.text();
        const table = parseGVizResponse(text);
        if (table.rows.length === 0) break;
        allRows = allRows.concat(table.rows);
        if (table.rows.length < 500) break;
      }

      // Find header row
      let headerIdx = -1;
      for (let i = 0; i < allRows.length; i++) {
        const row = allRows[i];
        if (!row.c) continue;
        const colB = getCellValue(row.c[1]).toLowerCase().trim();
        if (colB === 'start time') { headerIdx = i; break; }
      }
      if (headerIdx === -1) continue;

      let currentDate = '';

      for (let i = headerIdx + 1; i < allRows.length; i++) {
        const row = allRows[i];
        if (!row.c) break;
        const name = getCellValue(row.c[4]);
        const dateVal = getCellValue(row.c[0]);
        const startTimeVal = getCellValue(row.c[1]);
        if (!name && !dateVal && !startTimeVal) break;
        if (dateVal) currentDate = dateVal;
        if (!name) continue;

        const startTime = startTimeVal;
        const endTime = getCellValue(row.c[2]);
        const cost = getCellValue(row.c[6]);
        const isAllDay = !startTime || startTime.toLowerCase().includes('all day');

        const rawTags = parseTags(getCellValue(row.c[7]));
        const costVal = getCellValue(row.c[6]);
        const foodBool = getCellBool(row.c[9]);
        const barBool = getCellBool(row.c[10]);

        const syntheticTags: string[] = [];
        if (!isFreeUtil(costVal)) syntheticTags.push('$$');
        if (foodBool) syntheticTags.push('🍕 Food');
        if (barBool) syntheticTags.push('🍺 Bar');

        const tags = [...rawTags, ...syntheticTags];
        const address = getCellValue(row.c[5]);
        const geo = address
          ? (geocodedData.addresses as Record<string, { lat: number; lng: number; matchedAddress?: string }>)[normalizeAddress(address)]
          : undefined;

        let id = generateEventId(tab.name, currentDate, startTime, name);
        const count = seenIds.get(id) ?? 0;
        seenIds.set(id, count + 1);
        const isDuplicate = count > 0;
        if (isDuplicate) id = `${id}-${count}`;

        events.push({
          id,
          isDuplicate,
          date: currentDate,
          dateISO: parseDateToISO(currentDate),
          startTime: isAllDay ? 'All Day' : startTime,
          endTime: endTime || '',
          isAllDay,
          organizer: getCellValue(row.c[3]),
          name,
          address,
          cost,
          isFree: isFreeUtil(cost),
          vibe: tags[0] || '',
          tags,
          conference: tab.name,
          link: getCellValue(row.c[8]),
          hasFood: getCellBool(row.c[9]),
          hasBar: getCellBool(row.c[10]),
          note: getCellValue(row.c[11]),
          timeOfDay: isAllDay ? 'all-day' : getTimeOfDayUtil(startTime),
          lat: geo?.lat,
          lng: geo?.lng,
          matchedAddress: geo?.matchedAddress,
        });
      }
    }

    return events;
  } catch {
    // If Google Sheets fetch fails, fall back to demo data
    console.warn('Google Sheets fetch failed, falling back to demo data');
    return fetchDemoEvents();
  }
}
