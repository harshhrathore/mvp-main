# Testing Infrastructure for SAMA Chat Integration (Frontend)

This directory contains the testing infrastructure and utilities for the SAMA Chat Integration feature frontend.

## Overview

The testing infrastructure supports both **unit tests** and **property-based tests** using:
- **fast-check**: Property-based testing library
- **MSW (Mock Service Worker)**: API mocking for tests
- **Vitest**: Test runner for frontend
- **React Testing Library**: Component testing utilities

## Files

### Core Testing Utilities

- **generators.ts**: Fast-check generators for creating random test data
  - Message generators (text, crisis)
  - Emotion generators (types, intensities)
  - Recommendation generators
  - Session and ID generators
  - Audio generators (base64, URLs)
  - API response generators (chat, voice, errors)
  - UI state generators
  - Local storage generators

- **mswHandlers.ts**: MSW request handlers for API mocking
  - Chat message handler
  - Voice chat handler
  - Session management handlers
  - Error scenario handlers (auth, network, server, validation)
  - Crisis response handler

- **mswServer.ts**: MSW server setup for Node.js test environment
  - Server configuration
  - Setup/teardown functions
  - Handler reset between tests

- **testUtilities.tsx**: Helper functions for testing
  - `renderWithProviders()`: Render components with React Query and Router
  - Local storage utilities
  - Mock data factories
  - Audio mocking utilities
  - Assertion helpers
  - Event simulation utilities

- **setup.ts**: Vitest configuration and global test setup
  - MSW server initialization
  - jest-dom matchers
  - Mock implementations (matchMedia, IntersectionObserver, localStorage)

### Example Tests

- **example.test.tsx**: Demonstrates usage of all testing utilities
  - Property-based test examples
  - Mock data usage examples
  - API mocking examples

## Usage

### Property-Based Testing

Property-based tests verify that properties hold for all generated inputs:

```typescript
import * as fc from 'fast-check';
import { messageArbitrary, emotionArbitrary } from './generators';

// Feature: sama-chat-integration, Property 1: Message Validation
test('all messages are valid', () => {
  fc.assert(
    fc.property(messageArbitrary, (message) => {
      expect(message.length).toBeGreaterThan(0);
      expect(message.length).toBeLessThanOrEqual(2000);
    }),
    { numRuns: 100 }
  );
});
```

### Component Testing with MSW

Mock API calls using MSW:

```typescript
import { render, screen } from '@testing-library/react';
import { server } from './mswServer';
import { chatMessageHandler } from './mswHandlers';
import { renderWithProviders } from './testUtilities';

test('displays chat response', async () => {
  // Use default handler (already set up in setup.ts)
  renderWithProviders(<ChatComponent />);
  
  // Interact with component
  // ...
  
  // Assertions
  expect(await screen.findByText('Mock response')).toBeInTheDocument();
});

test('handles error response', async () => {
  // Override handler for this test
  server.use(errorHandlers.server);
  
  renderWithProviders(<ChatComponent />);
  
  // Assertions for error state
});
```

### Mock Data

Use factory functions for consistent mock data:

```typescript
import { createMockChatResponse, createMockRecommendation } from './testUtilities';

test('renders chat response', () => {
  const response = createMockChatResponse({
    reply: 'Test reply',
    emotion: { primary: 'joy', intensity: 0.8 }
  });
  
  // Use response in test
});
```

### Audio Mocking

Mock MediaRecorder and getUserMedia:

```typescript
import { mockMediaRecorder, mockGetUserMedia } from './testUtilities';

test('records audio', () => {
  const recorder = mockMediaRecorder();
  const stream = mockGetUserMedia();
  
  // Test voice recording functionality
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/test/example.test.tsx

# Run in watch mode
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

## MSW Handler Customization

### Using Different Handlers

```typescript
import { server } from './mswServer';
import { errorHandlers, scenarioHandlers } from './mswHandlers';

test('handles authentication error', async () => {
  server.use(errorHandlers.auth);
  // Test code
});

test('handles crisis response', async () => {
  server.use(scenarioHandlers.crisis);
  // Test code
});
```

### Creating Custom Handlers

```typescript
import { http, HttpResponse } from 'msw';

const customHandler = http.post('/api/chat/message', () => {
  return HttpResponse.json({
    success: true,
    data: {
      reply: 'Custom response',
      // ... other fields
    }
  });
});

server.use(customHandler);
```

## Property Test Format

All property tests must follow this format:

```typescript
// Feature: sama-chat-integration, Property {number}: {property_name}
test('property description', () => {
  fc.assert(
    fc.property(arbitrary, (value) => {
      // Test assertions
    }),
    { numRuns: 100 }
  );
});
```

## Best Practices

1. **Use property tests for universal properties**: Test behaviors that should hold for all inputs
2. **Use unit tests for specific examples**: Test concrete scenarios and edge cases
3. **Run at least 100 iterations**: Property tests should run 100+ times for good coverage
4. **Reset MSW handlers after each test**: Automatically done in setup.ts
5. **Use renderWithProviders**: Always wrap components with necessary providers
6. **Mock browser APIs**: Use provided utilities for MediaRecorder, getUserMedia, etc.
7. **Tag tests with feature name**: Use comments to link tests to design properties

## Troubleshooting

### MSW Not Intercepting Requests

Make sure:
1. MSW server is started in setup.ts (already configured)
2. Handlers match the exact API endpoint
3. Request method (GET, POST) matches the handler

### Fast-check NaN Issues

Always use `noNaN: true` for double generators:
```typescript
fc.double({ min: 0, max: 1, noNaN: true })
```

### Component Not Rendering

Make sure to use `renderWithProviders` instead of plain `render`:
```typescript
// ❌ Wrong
render(<MyComponent />);

// ✅ Correct
renderWithProviders(<MyComponent />);
```

### Async Test Issues

Use `findBy` queries for async elements:
```typescript
// Wait for element to appear
const element = await screen.findByText('Loading complete');
```

## Available Generators

- `messageArbitrary`: Random chat messages (1-2000 chars)
- `emotionArbitrary`: Emotion objects with type and intensity
- `recommendationArbitrary`: Wellness recommendations
- `chatResponseArbitrary`: Complete chat API responses
- `voiceResponseArbitrary`: Complete voice API responses
- `sessionIdArbitrary`: UUID v4 session IDs
- `audioBase64Arbitrary`: Base64 encoded audio strings
- `errorMessageArbitrary`: Error messages
- `apiErrorArbitrary`: API error responses

See `generators.ts` for the complete list.
