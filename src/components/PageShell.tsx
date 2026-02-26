'use client';

import { NavBar } from './NavBar';
import { CommunityFooter } from './CommunityFooter';

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
}

export function PageShell({ children, title }: PageShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-900">
      <NavBar />
      <main className="flex-1">
        {title && (
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
          </div>
        )}
        {children}
      </main>
      <CommunityFooter />
    </div>
  );
}
