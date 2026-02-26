'use client';

import Link from 'next/link';
import { Heart, MapPin, Instagram, Facebook, ExternalLink } from 'lucide-react';

export function CommunityFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Logo and address */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="text-white font-bold">Heart of Ellsworth</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>16 State Street, Ellsworth, ME 04605</span>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider font-medium">Explore</h4>
            <div className="space-y-1">
              <Link href="/events" className="block text-sm text-slate-400 hover:text-white transition-colors">Events</Link>
              <Link href="/artists" className="block text-sm text-slate-400 hover:text-white transition-colors">Artists</Link>
              <Link href="/spaces" className="block text-sm text-slate-400 hover:text-white transition-colors">Spaces</Link>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider font-medium">Community</h4>
            <div className="space-y-1">
              <Link href="/ideas" className="block text-sm text-slate-400 hover:text-white transition-colors">Share an Idea</Link>
              <Link href="/analytics" className="block text-sm text-slate-400 hover:text-white transition-colors">Analytics</Link>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider font-medium">Contact</h4>
            <div className="space-y-1">
              <a href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">Contact Us</a>
              <a href="#" className="block text-sm text-slate-400 hover:text-white transition-colors">Volunteer</a>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs text-slate-500 uppercase tracking-wider font-medium">Follow</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <span>&copy; {new Date().getFullYear()} Heart of Ellsworth</span>
          <a
            href="https://events.yodel.today"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            Powered by Yodel
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
