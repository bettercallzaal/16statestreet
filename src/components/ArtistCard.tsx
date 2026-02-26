'use client';

import { User } from 'lucide-react';

export interface Artist {
  id: string;
  name: string;
  role: 'resident' | 'instructor' | 'community';
  medium: string[];
  bio: string;
  website: string;
  instagram: string;
  upcomingWorkshopCount: number;
  pastWorkshopCount: number;
  joinedDate: string;
}

interface ArtistCardProps {
  artist: Artist;
  onClick: (artist: Artist) => void;
}

const ROLE_STYLES: Record<Artist['role'], { bg: string; text: string; label: string }> = {
  resident: { bg: 'bg-rose-500/15', text: 'text-rose-400', label: 'Resident' },
  instructor: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'Instructor' },
  community: { bg: 'bg-slate-600/40', text: 'text-slate-300', label: 'Community' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ArtistCard({ artist, onClick }: ArtistCardProps) {
  const role = ROLE_STYLES[artist.role];

  return (
    <div
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-rose-500/50 transition-colors cursor-pointer group"
      onClick={() => onClick(artist)}
    >
      {/* Header: avatar + name + role */}
      <div className="flex items-start gap-3">
        {/* Initials avatar */}
        <div className="w-11 h-11 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
          <span className="text-rose-400 font-semibold text-sm">
            {getInitials(artist.name)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-rose-400 transition-colors">
            {artist.name}
          </h3>
          <span
            className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${role.bg} ${role.text}`}
          >
            {role.label}
          </span>
        </div>
      </div>

      {/* Medium tags */}
      {artist.medium.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {artist.medium.map((m) => (
            <span
              key={m}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-slate-700 text-slate-300"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Bio excerpt */}
      <p className="text-slate-400 text-xs leading-relaxed mt-3 line-clamp-2">
        {artist.bio}
      </p>

      {/* Footer: workshop count */}
      {artist.upcomingWorkshopCount > 0 && (
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500">
          <User className="w-3 h-3" />
          <span>
            {artist.upcomingWorkshopCount} upcoming workshop
            {artist.upcomingWorkshopCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
