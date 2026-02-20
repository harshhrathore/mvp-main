/**
 * Dashboard Service Tests
 */

import { getDashboardSummary } from '../../services/dashboardService';
import { pool } from '../../config/db';

// Mock pool
jest.mock('../../config/db');

describe('Dashboard Service', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should aggregate dashboard data successfully', async () => {
    const userId = 'user-123';

    // Mock user profile
    mockClient.query.mockResolvedValueOnce({
      rows: [{ full_name: 'John Doe', onboarding_completed: true }],
    });

    // Mock dosha profile
    mockClient.query.mockResolvedValueOnce({
      rows: [
        {
          primary_dosha: 'vata',
          secondary_dosha: 'pitta',
          percentages: { vata: 50, pitta: 30, kapha: 20 },
          assessed_at: '2024-01-15',
        },
      ],
    });

    // Mock check-ins
    mockClient.query.mockResolvedValueOnce({
      rows: [
        { id: '1', mood_score: 8, energy_level: 7, stress_level: 3, created_at: '2024-01-15' },
      ],
    });

    // Mock activities
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: '1', activity_type: 'yoga', duration: 30, created_at: '2024-01-15' }],
    });

    // Mock recommendations
    mockClient.query.mockResolvedValueOnce({
      rows: [{ id: '1', category: 'exercise', title: 'Morning yoga', priority: 'high' }],
    });

    // Mock stats
    mockClient.query.mockResolvedValueOnce({
      rows: [{ total_daily_progress: '10', total_conversations: '15' }],
    });

    // Mock streak
    mockClient.query.mockResolvedValueOnce({
      rows: [{ current_streak: '5' }],
    });

    const result = await getDashboardSummary(userId);

    expect(result.user_profile.full_name).toBe('John Doe');
    expect(result.dosha_profile?.primary_dosha).toBe('vata');
    expect(result.stats.total_daily_progress).toBe(10);
    expect(result.stats.current_streak).toBe(5);
    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should handle user not found', async () => {
    mockClient.query.mockResolvedValueOnce({ rows: [] });

    await expect(getDashboardSummary('invalid-user')).rejects.toThrow('User not found');
    expect(mockClient.release).toHaveBeenCalled();
  });
});
