// lib/user-context.tsx
import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
export const UserCtx = createContext<User | null>(null);
export const useUser = () => useContext(UserCtx);
