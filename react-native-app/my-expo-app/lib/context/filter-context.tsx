// lib/context/filter-context.tsx
import React, { createContext, useContext, useState } from 'react';

type FilterCtxType = {
  query: string;
  setQuery: (v: string) => void;
  showCompleted: boolean; // true = show completed forms, false = in-progress
  setShowCompleted: (v: boolean) => void;
};

const FilterCtx = createContext<FilterCtxType | null>(null);
export const useFilters = () => {
  const ctx = useContext(FilterCtx);
  if (!ctx) throw new Error('useFilters must be used inside <FilterProvider>');
  return ctx;
};

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  return (
    <FilterCtx.Provider value={{ query, setQuery, showCompleted, setShowCompleted }}>
      {children}
    </FilterCtx.Provider>
  );
}
