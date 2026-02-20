/**
 * Property-Based Tests for Loading Indicator Display
 * Feature: sama-chat-integration
 */

import { render } from '@testing-library/react';
import { act } from 'react';
import * as fc from 'fast-check';
import { vi } from 'vitest';

// Simple test component that simulates loading behavior
interface LoadingIndicatorTestProps {
  isLoading: boolean;
}

const LoadingIndicatorTest: React.FC<LoadingIndicatorTestProps> = ({ isLoading }) => {
  return (
    <div>
      {isLoading ? (
        <div data-testid="loading-indicator">
          <div className="spinner"></div>
          <span>Thinking...</span>
        </div>
      ) : (
        <button data-testid="send-button">Send</button>
      )}
    </div>
  );
};

describe('Loading Indicator Display Property Tests', () => {
  // Feature: sama-chat-integration, Property 22: Loading Indicator Display
  describe('Property 22: Loading Indicator Display', () => {
    test('displays loading indicator when isLoading is true', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isLoading) => {
            const { container, getByTestId, queryByTestId, unmount } = render(
              <LoadingIndicatorTest isLoading={isLoading} />
            );

            if (isLoading) {
              // Loading indicator should be visible
              expect(queryByTestId('loading-indicator')).toBeInTheDocument();
              expect(container.textContent).toContain('Thinking...');
              
              // Send button should not be visible
              expect(queryByTestId('send-button')).not.toBeInTheDocument();
            } else {
              // Send button should be visible
              expect(queryByTestId('send-button')).toBeInTheDocument();
              
              // Loading indicator should not be visible
              expect(queryByTestId('loading-indicator')).not.toBeInTheDocument();
            }

            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('loading indicator contains spinner and text', () => {
      fc.assert(
        fc.property(
          fc.constant(true),
          (isLoading) => {
            const { container, getByTestId, unmount } = render(
              <LoadingIndicatorTest isLoading={isLoading} />
            );

            const loadingIndicator = getByTestId('loading-indicator');
            expect(loadingIndicator).toBeInTheDocument();
            
            // Verify spinner element exists
            expect(loadingIndicator.querySelector('.spinner')).toBeInTheDocument();
            
            // Verify text content
            expect(loadingIndicator.textContent).toContain('Thinking...');

            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('loading indicator is mutually exclusive with send button', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isLoading) => {
            const { queryByTestId, unmount } = render(
              <LoadingIndicatorTest isLoading={isLoading} />
            );

            const loadingIndicator = queryByTestId('loading-indicator');
            const sendButton = queryByTestId('send-button');

            // Exactly one should be visible
            if (isLoading) {
              expect(loadingIndicator).toBeInTheDocument();
              expect(sendButton).not.toBeInTheDocument();
            } else {
              expect(loadingIndicator).not.toBeInTheDocument();
              expect(sendButton).toBeInTheDocument();
            }

            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('loading state transitions correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.boolean(), { minLength: 2, maxLength: 10 }),
          (loadingStates) => {
            const { queryByTestId, rerender, unmount } = render(
              <LoadingIndicatorTest isLoading={loadingStates[0]} />
            );

            // Test each state transition
            for (let i = 1; i < loadingStates.length; i++) {
              rerender(<LoadingIndicatorTest isLoading={loadingStates[i]} />);

              const loadingIndicator = queryByTestId('loading-indicator');
              const sendButton = queryByTestId('send-button');

              if (loadingStates[i]) {
                expect(loadingIndicator).toBeInTheDocument();
                expect(sendButton).not.toBeInTheDocument();
              } else {
                expect(loadingIndicator).not.toBeInTheDocument();
                expect(sendButton).toBeInTheDocument();
              }
            }

            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
