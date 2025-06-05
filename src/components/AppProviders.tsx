"use client";

import type { ReactNode } from 'react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  // return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  // For now, just pass children through if no client-side providers are strictly needed yet.
  return <>{children}</>;
}
