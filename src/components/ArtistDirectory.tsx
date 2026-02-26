'use client';

import { useState, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import artistsData from '@/data/demo-artists.json';
import { ArtistCard } from './ArtistCard';
import { ArtistDetail } from './ArtistDetail';
import type { Artist } from './ArtistCard';

export function ArtistDirectory() {
  const [selectedMedium, setSelectedMedium] = useState<string>('All');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Cast the imported JSON to Artist[]
  const artists: Artist[] = artistsData as Artist[];

  // Extract all unique mediums from artist data
  const allMediums = useMemo(() => {
    const mediumSet = new Set<string>();
    artists.forEach((a) => a.medium.forEach((m) => mediumSet.add(m)));
    return Array.from(mediumSet).sort();
  }, [artists]);

  // Filter artists by selected medium
  const filteredArtists = useMemo(() => {
    if (selectedMedium === 'All') return artists;
    return artists.filter((a) => a.medium.includes(selectedMedium));
  }, [artists, selectedMedium]);

  // Open detail panel
  function handleCardClick(artist: Artist) {
    setSelectedArtist(artist);
    setDetailOpen(true);
  }

  // Close detail panel
  function handleCloseDetail() {
    setDetailOpen(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      {/* Summary */}
      <div className="flex items-center gap-2 mt-2 mb-5 text-sm text-slate-400">
        <Users className="w-4 h-4 text-rose-400" />
        <span>
          {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''}
          {selectedMedium !== 'All' && (
            <> in <span className="text-slate-300 font-medium">{selectedMedium}</span></>
          )}
        </span>
      </div>

      {/* Medium filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedMedium('All')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
            selectedMedium === 'All'
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300'
          }`}
        >
          All
        </button>
        {allMediums.map((medium) => (
          <button
            key={medium}
            onClick={() => setSelectedMedium(medium)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
              selectedMedium === medium
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            {medium}
          </button>
        ))}
      </div>

      {/* Artist grid */}
      {filteredArtists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArtists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={handleCardClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">
            No artists found for &ldquo;{selectedMedium}&rdquo;.
          </p>
          <button
            onClick={() => setSelectedMedium('All')}
            className="mt-2 text-sm text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Artist detail slide-over */}
      <ArtistDetail
        artist={selectedArtist}
        isOpen={detailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
