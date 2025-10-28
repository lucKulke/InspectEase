// lib/queries/useFormsQuery.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

import { DBActionsFormFillerFetch } from '../db/form-filler/fetch';

export function useFormsQuery(teamId: string | null) {
  const formFillerFetch = new DBActionsFormFillerFetch(supabase);
  return useQuery({
    queryKey: ['forms', teamId], // key by team
    enabled: !!teamId, // wait for team to exist
    queryFn: async () => {
      const { forms, formsError } = await formFillerFetch.fetchAllForms();

      if (formsError) throw formsError;
      return forms ?? [];
    },
  });
}
