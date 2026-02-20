/**
 * Property-Based Tests for Crisis Helpline Display
 * Feature: sama-chat-integration
 */

import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import CrisisHelpline from '../components/wellness/CrisisHelpline';

describe('Crisis Helpline Display Property Tests', () => {
  // Feature: sama-chat-integration, Property 6: Crisis Helpline Display
  describe('Property 6: Crisis Helpline Display', () => {
    test('displays emergency hotline numbers for any crisis level', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high', 'severe'),
          (crisisLevel) => {
            const { container, unmount } = render(<CrisisHelpline crisisLevel={crisisLevel} />);
            
            // Verify emergency hotline numbers are displayed
            expect(container.textContent).toContain('National Suicide Prevention Lifeline');
            expect(container.textContent).toContain('988');
            expect(container.textContent).toContain('Crisis Text Line');
            expect(container.textContent).toContain('741741');
            
            // Verify international resources link
            expect(container.textContent).toContain('International Association for Suicide Prevention');
            
            // Verify additional support section
            expect(container.textContent).toContain('Additional Support');
            expect(container.textContent).toContain('Call emergency services (911)');
            
            // Verify acknowledgment button
            expect(container.textContent).toContain("I'm Safe");
            
            // Verify crisis resources are visible
            expect(container.textContent).toContain('emergency room');
            expect(container.textContent).toContain('trusted friend or family member');
            expect(container.textContent).toContain('mental health provider');
            
            // Clean up after each iteration
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('displays appropriate styling based on crisis level severity', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high', 'severe'),
          (crisisLevel) => {
            const { container, unmount } = render(<CrisisHelpline crisisLevel={crisisLevel} />);
            
            const isHighCrisis = crisisLevel === 'high' || crisisLevel === 'severe';
            
            // Check for appropriate header text based on severity
            if (isHighCrisis) {
              expect(container.textContent).toContain('Immediate Help Available');
            } else {
              expect(container.textContent).toContain('Support Resources Available');
            }
            
            // Verify the component renders with appropriate visual indicators
            expect(container.querySelector('[style*="border"]')).toBeInTheDocument();
            expect(container.querySelector('[style*="padding"]')).toBeInTheDocument();
            
            // Clean up after each iteration
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('always displays crisis emoji indicator', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high', 'severe'),
          (crisisLevel) => {
            const { container, unmount } = render(<CrisisHelpline crisisLevel={crisisLevel} />);
            
            // Verify SOS emoji is present
            expect(container.textContent).toContain('🆘');
            
            // Clean up after each iteration
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('displays all required crisis resources for any crisis level', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high', 'severe'),
          (crisisLevel) => {
            const { container, unmount } = render(<CrisisHelpline crisisLevel={crisisLevel} />);
            
            const requiredResources = [
              '988',
              '741741',
              'emergency services (911)',
              'emergency room',
              'trusted friend or family member',
              'mental health provider'
            ];
            
            requiredResources.forEach(resource => {
              expect(container.textContent?.toLowerCase()).toContain(resource.toLowerCase());
            });
            
            // Clean up after each iteration
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
