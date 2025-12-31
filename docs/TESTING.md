# Testing Documentation

## Overview

This project implements a comprehensive testing strategy with >80% code coverage across unit, integration, and end-to-end tests.

## Testing Stack

- **Unit & Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Cypress
- **Coverage**: Vitest Coverage (v8)
- **Mocking**: Vitest mocks for Supabase, external APIs

## Test Structure

```
src/__tests__/
├── setup.ts                          # Global test setup
├── hooks/                            # Hook unit tests
│   ├── useOnboarding.test.ts
│   ├── useCopyrightPrecheck.test.ts
│   ├── useTOSManagement.test.ts
│   └── useFeatureTour.test.ts
├── components/                       # Component unit tests
│   ├── ErrorBoundary.test.tsx
│   ├── AIGenerator.test.tsx
│   ├── BattleCard.test.tsx
│   └── MintingFlow.test.tsx
└── integration/                      # Integration tests
    └── AuthContext.test.tsx

cypress/
├── e2e/                              # E2E tests
│   ├── smoke.cy.ts
│   ├── minting-flow.cy.ts
│   └── battle-flow.cy.ts
├── support/
│   ├── commands.ts                   # Custom Cypress commands
│   └── e2e.ts                        # Cypress setup
└── cypress.config.ts
```

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/__tests__/hooks/useOnboarding.test.ts
```

### E2E Tests

```bash
# Open Cypress UI
pnpm cypress:open

# Run Cypress headless
pnpm cypress:run

# Run specific E2E test
pnpm cypress:run --spec "cypress/e2e/smoke.cy.ts"
```

## Coverage Requirements

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

Coverage reports are generated in:
- `coverage/` - HTML and JSON reports
- Console output after running `pnpm test:coverage`

## Test Categories

### 1. Hook Unit Tests

Test custom React hooks in isolation with mocked dependencies.

**Example: `useOnboarding.test.ts`**
- Tests onboarding state management
- Mocks Supabase client
- Validates async operations
- Tests error handling

**Coverage:**
- ✅ Initial state
- ✅ Successful onboarding completion
- ✅ Error states
- ✅ Loading states
- ✅ Supabase integration

### 2. Component Unit Tests

Test React components with user interactions and state changes.

**Example: `ErrorBoundary.test.tsx`**
- Tests error catching
- Validates fallback UI
- Tests Sentry integration
- Tests reset functionality

**Example: `AIGenerator.test.tsx`**
- Tests AI generation flow
- Validates form inputs
- Tests loading states
- Tests error handling

**Example: `BattleCard.test.tsx`**
- Tests battle display
- Validates status badges
- Tests user interactions
- Tests responsive design

**Coverage:**
- ✅ Rendering
- ✅ User interactions
- ✅ State changes
- ✅ Error states
- ✅ Edge cases

### 3. Integration Tests

Test multiple components/contexts working together.

**Example: `AuthContext.test.tsx`**
- Tests authentication flow
- Validates user state management
- Tests Sentry user context sync
- Tests session persistence
- Tests logout functionality

**Coverage:**
- ✅ Login flow
- ✅ Signup flow
- ✅ Session management
- ✅ Error handling
- ✅ User context sync

### 4. E2E Tests

Test complete user workflows in a real browser environment.

**Smoke Tests (`smoke.cy.ts`)**
- Homepage loading
- Navigation
- Responsive design
- Performance
- Accessibility
- Error handling

**Minting Flow (`minting-flow.cy.ts`)**
- AI generation workflow
- Manual upload workflow
- Remake functionality
- Copyright compliance
- Form validation

**Battle Flow (`battle-flow.cy.ts`)**
- Battle list display
- Battle filtering
- Battle details
- Join battle
- Voting
- Leaderboard

## Writing Tests

### Hook Testing Pattern

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

describe('useCustomHook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle async operation', async () => {
    const { result } = renderHook(() => useCustomHook());
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### Component Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### E2E Testing Pattern

```typescript
describe('Feature Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete user workflow', () => {
    cy.contains('Start').click();
    cy.get('input[name="field"]').type('value');
    cy.contains('Submit').click();
    cy.contains('Success').should('exist');
  });
});
```

## Mocking

### Supabase Mock

```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));
```

### Sentry Mock

```typescript
vi.mock('@/lib/sentry', () => ({
  captureException: vi.fn(),
  setUser: vi.fn(),
  captureMessage: vi.fn(),
}));
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Clear mocks between tests

### 2. Descriptive Test Names
```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should display error message when API call fails', () => { ... });
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should update count on button click', () => {
  // Arrange
  render(<Counter />);
  
  // Act
  fireEvent.click(screen.getByRole('button'));
  
  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 4. Test User Behavior, Not Implementation
```typescript
// ❌ Bad - testing implementation
expect(component.state.count).toBe(1);

// ✅ Good - testing user-visible behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### 5. Use Testing Library Queries Properly
```typescript
// Preferred order:
getByRole()        // Most accessible
getByLabelText()   // Form elements
getByPlaceholderText()
getByText()
getByDisplayValue()
getByAltText()
getByTitle()
getByTestId()      // Last resort
```

### 6. Async Testing
```typescript
// ✅ Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// ✅ Use findBy queries (built-in waitFor)
const element = await screen.findByText('Loaded');
```

### 7. Error Testing
```typescript
it('should handle errors gracefully', async () => {
  // Mock error
  vi.mocked(apiCall).mockRejectedValue(new Error('API Error'));
  
  render(<Component />);
  
  // Verify error handling
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Pre-deployment

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm cypress:run
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Troubleshooting

### Common Issues

**1. Tests timing out**
```typescript
// Increase timeout for slow operations
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 5000 });
```

**2. Mock not working**
```typescript
// Ensure mock is hoisted
vi.mock('@/lib/supabase', () => ({ ... }));

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

**3. Cypress element not found**
```typescript
// Use proper waiting
cy.contains('Button', { timeout: 10000 }).should('exist');

// Or use cy.get with should
cy.get('[data-testid="element"]').should('be.visible');
```

**4. React Testing Library queries failing**
```typescript
// Use screen.debug() to see current DOM
screen.debug();

// Use getAllBy* for multiple elements
const buttons = screen.getAllByRole('button');
```

## Coverage Reports

After running `pnpm test:coverage`, view reports:

1. **Console**: Summary in terminal
2. **HTML**: Open `coverage/index.html` in browser
3. **LCOV**: `coverage/lcov.info` for CI tools

### Interpreting Coverage

- **Green (>80%)**: Good coverage
- **Yellow (60-80%)**: Needs improvement
- **Red (<60%)**: Insufficient coverage

Focus on:
- Critical business logic
- Error handling paths
- User interaction flows
- Edge cases

## Continuous Improvement

### Adding New Tests

1. Identify untested code from coverage report
2. Write test following patterns above
3. Run coverage to verify improvement
4. Commit with descriptive message

### Maintaining Tests

- Update tests when features change
- Remove tests for deleted features
- Refactor tests to reduce duplication
- Keep mocks up to date with APIs

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Support

For testing questions or issues:
1. Check this documentation
2. Review existing test examples
3. Consult team testing guidelines
4. Ask in team chat/Slack
