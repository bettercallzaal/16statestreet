'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { HAS_SUPABASE } from '@/lib/constants';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  session: unknown | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [session, setSession] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(HAS_SUPABASE);

  useEffect(() => {
    if (!HAS_SUPABASE) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: { user: { id: string; email?: string } } | null } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, s: { user: { id: string; email?: string } } | null) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string) => {
    if (!HAS_SUPABASE) return { error: 'Authentication not configured' };
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error: error?.message ?? null };
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    if (!HAS_SUPABASE) return { error: 'Authentication not configured' };
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (!HAS_SUPABASE) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
