# Testing Infrastructure for SAMA Chat Integration

This directory contains the testing infrastructure and utilities for the SAMA Chat Integration feature.

## Overview

The testing infrastructure supports both **unit tests** and **property-based tests** using:
- **fast-check**: Property-based testing library
- **pg-mem**: In-memory PostgreSQL database for testing
- **Jest**: Test runner for backend

## Files

### Core Testing Utilities

- **generators.ts**: Fast-check generators for creating random test data
  - Message generators (text, crisis, suggestions)
  - Emotion generators (types, intensities, multi-emotion)
  - Dosha generators (types, profiles, scores)
  - User preference generators
  - Recommendation generators
  - Session and ID generators
  - Audio generators (base64, URLs)
  - Response structure generators (chat, voice)
  - Error generators

- **dbSetup.ts**: In-memory database setup using pg-mem
  - `createTestDatabase()`: Creates in-memory PostgreSQL instance
  - `initializeTestSchema()`: Sets up SAMA database schema
  - `seedTestData()`: Creates sample test data
  - `clearTestData()`: Cleans up test data
  - `setupTestEnvironment()`: Complete test environment setup

- **testUtilities.ts**: Helper functions for testing
  - Authentication utilities (JWT token generation)
  - Database utilities (create users, sessions, messages)
  - Mock data factories
  - Assertion helpers
  - Time utilities

- **setup.ts**: Jest configuration and global test setup

### Example Tests

- **example.test.ts**: Demonstrates usage of all testing utilities
  - Property-based test examples
  - Database testing examples
  - Mock data usage examples

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

### Database Testing

Use pg-mem for in-memory database testing:

```typescript
import { setupTestEnvironment } from './dbSetup';

test('can create and query database', async () => {
  const { pool, userId, sessionId, cleanup } = await setupTestEnvironment();
  
  // Your test code here
  const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
  expect(result.rows.length).toBe(1);
  
  await cleanup();
});
```

### Mock Data

Use factory functions for consistent mock data:

```typescript
import { createMockChatResponse, generateTestToken } from './testUtilities';

test('handles chat response', () => {
  const response = createMockChatResponse('Test reply', { primary: 'joy', intensity: 0.8 });
  expect(response.data.reply).toBe('Test reply');
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tests/example.test.ts

# Run without coverage
npm test -- --no-coverage

# Run with timeout
npm test -- --testTimeout=15000
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
4. **Clean up after tests**: Always call cleanup functions for database tests
5. **Use descriptive test names**: Include the property number and description
6. **Tag tests with feature name**: Use comments to link tests to design properties

## Troubleshooting

### pg-mem Limitations

pg-mem doesn't support all PostgreSQL features:
- Use `FLOAT` instead of `DECIMAL(x,y)` for decimal numbers
- Some advanced SQL features may not work
- Check pg-mem documentation for supported features

### Fast-check NaN Issues

Always use `noNaN: true` for double generators:
```typescript
fc.double({ min: 0, max: 1, noNaN: true })
```

### Test Timeouts

For slow tests, increase timeout:
```typescript
test('slow test', async () => {
  // test code
}, 15000); // 15 second timeout
```
