/**
 * Frontend Test Utilities
 * Shared utilities and helpers for React component testing
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a new QueryClient for testing
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper with all providers (Router, QueryClient, etc.)
 */
const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function with all providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

/**
 * Mock API response
 */
export const createMockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
});

/**
 * Mock user data
 */
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  created_at: new Date().toISOString(),
};

/**
 * Mock dosha profile
 */
export const mockDoshaProfile = {
  primary_dosha: 'Vata',
  secondary_dosha: 'Pitta',
  prakriti_scores: {
    vata: 0.5,
    pitta: 0.3,
    kapha: 0.2,
  },
  confidence_score: 0.75,
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};

/**
 * Wait for async operations
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
