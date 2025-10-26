import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

type Ctx = { session: Session | null; isLoading: boolean };
const SessionContext = createContext<Ctx>({ session: null, isLoading: true });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>{children}</SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
