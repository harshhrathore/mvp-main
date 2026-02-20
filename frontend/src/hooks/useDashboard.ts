/**
 * Dashboard Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../api/dashboard';

/**
 * Hook to fetch dashboard summary
 */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
    staleTime: 30000, // 30 seconds
    retry: 1,
  });
}
