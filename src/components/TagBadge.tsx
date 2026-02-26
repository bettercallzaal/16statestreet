'use client';

import {
  Mic,
  Handshake,
  Palette,
  Heart,
  Coffee,
  Beer,
  GraduationCap,
  UtensilsCrossed,
  Drama,
  PartyPopper,
  Ticket,
  Store,
  Trees,
  Music,
  Baby,
  Hammer,
  Briefcase,
  Brush,
  Camera,
  Dumbbell,
  Laptop,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { VIBE_COLORS } from '@/lib/constants';

type IconComponent = LucideIcon | ((props: React.SVGProps<SVGSVGElement>) => React.ReactNode);

export const TAG_ICONS: Record<string, IconComponent> = {
  '$$': Ticket,
  'Workshop': GraduationCap,
  'Open Studio': Brush,
  'Arts': Palette,
  'Music': Music,
  'Market': ShoppingBag,
  'Meetup': Handshake,
  'Performance': Drama,
  'Film': Camera,
  'Wellness': Dumbbell,
  'Makerspace': Hammer,
  'Coworking': Laptop,
  'Business': Briefcase,
  'Food': UtensilsCrossed,
  'Outdoors': Trees,
  'Kids/Family': Baby,
  'Party': PartyPopper,
  'Coffee': Coffee,
  'Bar/Pub': Beer,
  'Art': Palette,
  'Community': Heart,
  'Retail': Store,
  'Talk': Mic,
  '🍕 Food': UtensilsCrossed,
  '🍺 Bar': Beer,
};

interface TagBadgeProps {
  tag: string;
  size?: 'sm' | 'md';
  iconOnly?: boolean;
  iconClassName?: string;
}

export function TagBadge({ tag, size = 'sm', iconOnly = false, iconClassName }: TagBadgeProps) {
  const Icon = TAG_ICONS[tag];
  const color = VIBE_COLORS[tag] || VIBE_COLORS['default'];
  const iconSize = iconClassName
    ? iconClassName
    : iconOnly
      ? 'w-5 h-5'
      : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  if (iconOnly) {
    return Icon ? (
      <span title={tag} className="inline-flex items-center justify-center">
        <Icon className={`${iconSize} flex-shrink-0`} style={{ color }} />
      </span>
    ) : null;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      title={tag}
    >
      {Icon && <Icon className={`${iconSize} flex-shrink-0`} style={{ color }} />}
      <span className="text-slate-300">{tag}</span>
    </span>
  );
}
