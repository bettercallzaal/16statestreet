import { HAS_SUPABASE } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

/** Creates a chainable query builder that returns empty results */
function mockQueryBuilder() {
  const builder: AnyRecord = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    in: () => builder,
    is: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (v: { data: null; error: null }) => void) => Promise.resolve({ data: null, error: null }).then(resolve),
  };
  return builder;
}

/** Mock Supabase client that no-ops everything */
const mockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOtp: () => Promise.resolve({ data: null, error: null }),
    verifyOtp: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => mockQueryBuilder(),
  rpc: () => Promise.resolve({ data: [], error: null }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabase: any;

if (HAS_SUPABASE) {
  // Dynamic import to avoid bundling @supabase/supabase-js when not needed
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} else {
  supabase = mockClient;
}

export { supabase };
