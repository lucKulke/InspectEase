export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    }
  }

  // minimal process type so TS stops complaining
  // (we don’t pull in all Node types)
  const process: { env: NodeJS.ProcessEnv };
}
