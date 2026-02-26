'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { HAS_SUPABASE } from '@/lib/constants';
import type { Friend, FriendLocation } from '@/lib/types';

export function useFriendLocations(friends: Friend[]) {
  const { user, loading: authLoading } = useAuth();
  const [friendLocations, setFriendLocations] = useState<FriendLocation[]>([]);

  const friendIds = useMemo(
    () => friends.map((f) => f.user_id).sort().join(','),
    [friends]
  );

  // Upsert own location on mount
  useEffect(() => {
    if (!HAS_SUPABASE || authLoading || !user) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        supabase
          .from('user_locations')
          .upsert(
            {
              user_id: user.id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .then(({ error }: { error: unknown }) => {
            if (error) console.error('Failed to upsert location:', error);
          });
      },
      (err) => {
        console.warn('Geolocation unavailable:', err.message);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [user, authLoading]);

  // Fetch friends' locations
  useEffect(() => {
    if (!HAS_SUPABASE || authLoading || !user || friends.length === 0) {
      setFriendLocations([]);
      return;
    }

    async function fetchLocations() {
      const { data, error } = await supabase.rpc('get_friends_locations');

      if (error) {
        console.error('Failed to fetch friends locations:', error);
        return;
      }

      const friendMap = new Map(friends.map((f) => [f.user_id, f]));
      const locations: FriendLocation[] = (data ?? []).map(
        (row: { user_id: string; lat: number; lng: number; updated_at: string }) => {
          const friend = friendMap.get(row.user_id);
          return {
            user_id: row.user_id,
            lat: row.lat,
            lng: row.lng,
            updated_at: row.updated_at,
            display_name: friend?.display_name ?? undefined,
            x_handle: friend?.x_handle ?? undefined,
          };
        }
      );

      setFriendLocations(locations);
    }

    fetchLocations();

    const interval = setInterval(fetchLocations, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, friendIds]);

  return friendLocations;
}
