# Sentry Error Tracking Integration Guide

## Overview

This document describes the comprehensive Sentry error tracking integration for the Kobo NFT Platform, covering frontend errors, Supabase database errors, and async operation failures.

---

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Error Boundaries](#error-boundaries)
3. [Supabase Error Tracking](#supabase-error-tracking)
4. [Async Error Handling](#async-error-handling)
5. [User Context Tracking](#user-context-tracking)
6. [Error Overlay UI](#error-overlay-ui)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Setup & Configuration

### Environment Variables

Add to `.env`:

```bash
# Sentry Error Tracking
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
VITE_APP_VERSION=1.0.0

# CI/CD Deployment (optional)
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

### Initialization

Sentry is automatically initialized in `src/main.tsx`:

```typescript
import { initSentry } from './lib/sentry';
import { initSupabaseErrorTracking } from './lib/supabaseErrorTracking';

// Initialize before rendering
initSentry();
initSupabaseErrorTracking();
```

### Configuration Options

Located in `src/lib/sentry.ts`:

- **Environment**: Automatically detected from `import.meta.env.MODE`
- **Release**: Uses `VITE_APP_VERSION` for version tracking
- **Sample Rates**:
  - Production: 10% performance traces, 10% session replays
  - Development: 100% traces and replays
- **Integrations**:
  - Browser tracing for performance monitoring
  - Session replay for debugging
  - React Router v6 integration

---

## Error Boundaries

### Global Error Boundary

Wraps the entire app in `src/App.tsx`:

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

const App = () => (
  <ErrorBoundary showDetails={import.meta.env.DEV}>
    {/* App content */}
  </ErrorBoundary>
);
```

### Component-Level Error Boundaries

Wrap critical components:

```typescript
import { withErrorBoundary } from '@/components/ErrorBoundary';

const MyComponent = () => {
  // Component code
};

export default withErrorBoundary(MyComponent, {
  fallback: <div>Custom error UI</div>,
  showDetails: true,
  onReset: () => console.log('Error boundary reset'),
});
```

### Sentry Error Boundary (Alternative)

Use Sentry's built-in error boundary:

```typescript
import { SentryErrorBoundary } from '@/components/ErrorBoundary';

<SentryErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</SentryErrorBoundary>
```

---

## Supabase Error Tracking

### Automatic Auth Tracking

Auth state changes are automatically tracked:

```typescript
// Automatically tracked in src/lib/supabaseErrorTracking.ts
supabase.auth.onAuthStateChange((event, session) => {
  // Logged to Sentry breadcrumbs
});
```

### Query Error Tracking

Wrap database queries with error tracking:

```typescript
import { withErrorTracking } from '@/lib/supabaseErrorTracking';

// Example: Fetch profiles
const { data, error } = await withErrorTracking('fetch profiles', () =>
  supabase.from('profiles').select('*')
);
```

### Storage Error Tracking

Track file upload/download errors:

```typescript
import { trackStorageOperation } from '@/lib/supabaseErrorTracking';

const data = await trackStorageOperation('upload avatar', 'nft-media', async () => {
  const { data, error } = await supabase.storage
    .from('nft-media')
    .upload(`avatars/${userId}.png`, file);
  
  if (error) throw error;
  return data;
});
```

### RPC Function Tracking

Track Supabase RPC calls:

```typescript
import { trackRPC } from '@/lib/supabaseErrorTracking';

const { data, error } = await trackRPC('calculate_battle_scores', {
  battle_id: battleId,
});
```

---

## Async Error Handling

### Basic Async Tracking

Wrap async operations:

```typescript
import { withAsyncErrorTracking } from '@/lib/asyncErrorHandler';

const data = await withAsyncErrorTracking('fetch user data', async () => {
  const response = await fetch('/api/user');
  return response.json();
});
```

### API Call Tracking

Specialized wrapper for API calls:

```typescript
import { withAPIErrorTracking } from '@/lib/asyncErrorHandler';

const users = await withAPIErrorTracking('users', 'GET', async () => {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('API request failed');
  return response.json();
});
```

### Safe Async (Non-Critical Operations)

Returns fallback value on error instead of throwing:

```typescript
import { safeAsync } from '@/lib/asyncErrorHandler';

const preferences = await safeAsync(
  'load preferences',
  async () => JSON.parse(localStorage.getItem('preferences') || '{}'),
  {} // Fallback value
);
```

### Retry with Exponential Backoff

Automatically retry failed operations:

```typescript
import { retryWithTracking } from '@/lib/asyncErrorHandler';

const result = await retryWithTracking('upload to IPFS', async () => {
  const response = await fetch('/api/ipfs/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}, {
  maxRetries: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
});
```

### Batch Processing with Error Tracking

Process arrays with error handling:

```typescript
import { batchWithTracking } from '@/lib/asyncErrorHandler';

const { successes, failures, errors } = await batchWithTracking(
  'mint NFTs',
  nftData,
  async (item, index) => {
    await mintNFT(item);
  },
  {
    batchSize: 5,
    continueOnError: true,
  }
);

console.log(`Minted ${successes} NFTs, ${failures} failed`);
```

### Timeout Wrapper

Add timeout to async operations:

```typescript
import { withTimeout } from '@/lib/asyncErrorHandler';

const data = await withTimeout('fetch data', async () => {
  return fetch('/api/slow-endpoint').then(r => r.json());
}, 5000); // 5 second timeout
```

---

## User Context Tracking

### Automatic User Tracking

User context is automatically set on auth state changes in `src/contexts/AuthContext.tsx`:

```typescript
// Automatically tracked
setSentryUser({
  id: session.user.id,
  email: session.user.email,
});

// Cleared on logout
clearSentryUser();
```

### Manual User Context

Set additional user properties:

```typescript
import { setSentryUser } from '@/lib/sentry';

setSentryUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

### Custom Context

Add custom context to errors:

```typescript
import { captureError } from '@/lib/sentry';

try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    nftId: tokenId,
    walletAddress: address,
    chainId: chain.id,
  });
}
```

---

## Error Overlay UI

### Per-Session Error Overlay

Located in `src/components/error-overlay.tsx`:

- Displays runtime errors during development
- Shows error message, file, line, and stack trace
- Allows users to report errors to Sentry
- Dismissible with visual feedback

### Features

1. **Error Details Toggle**: Show/hide technical details
2. **Report Button**: Send error to Sentry with user context
3. **Visual Feedback**: Confirmation when error is reported
4. **Stack Trace**: Full stack trace for debugging

### Usage

Automatically integrated via `withErrorOverlay` HOC in `src/main.tsx`:

```typescript
import { withErrorOverlay } from './components/with-error-overlay';

const AppWithErrorOverlay = withErrorOverlay(App);
```

---

## Best Practices

### 1. Error Categorization

Use consistent categories for filtering:

```typescript
captureError(error, {
  category: 'blockchain', // blockchain, database, api, ui, etc.
  operation: 'mint NFT',
  severity: 'error', // error, warning, info
});
```

### 2. Breadcrumbs for Context

Add breadcrumbs before critical operations:

```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb('User clicked mint button', 'ui', {
  nftType: 'collaborative',
  participants: 3,
});

// ... perform minting
```

### 3. Filter User-Initiated Errors

Already configured in `src/lib/sentry.ts`:

```typescript
beforeSend(event, hint) {
  const message = String(error.message).toLowerCase();
  if (
    message.includes('user rejected') ||
    message.includes('user denied')
  ) {
    return null; // Don't send to Sentry
  }
  return event;
}
```

### 4. Performance Monitoring

Wrap performance-critical operations:

```typescript
import { measurePerformanceAsync } from '@/lib/sentry';

const result = await measurePerformanceAsync('render NFT gallery', async () => {
  return fetchAndRenderNFTs();
});
```

### 5. Blockchain Transaction Tracking

Track transaction lifecycle:

```typescript
import { trackTransaction } from '@/lib/sentry';

trackTransaction(txHash, 'mint NFT', {
  tokenId,
  recipient: address,
  chainId: chain.id,
});
```

### 6. IPFS Upload Tracking

Track IPFS operations:

```typescript
import { trackIPFSUpload } from '@/lib/sentry';

trackIPFSUpload(ipfsHash, 'media', {
  fileSize: file.size,
  mimeType: file.type,
});
```

### 7. AI Generation Tracking

Track AI model usage:

```typescript
import { trackAIGeneration } from '@/lib/sentry';

trackAIGeneration('stable-diffusion-xl', prompt, success);
```

---

## Troubleshooting

### Sentry Not Initialized

**Symptom**: Console warning "Sentry DSN not configured"

**Solution**: Add `VITE_SENTRY_DSN` to `.env` file

```bash
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### Errors Not Appearing in Sentry

**Check**:
1. DSN is correct
2. Environment is not filtered (check Sentry project settings)
3. Error is not filtered by `beforeSend` hook
4. Sample rate is not too low (check `tracesSampleRate`)

### Too Many Errors

**Solution**: Adjust sample rates in `src/lib/sentry.ts`:

```typescript
tracesSampleRate: 0.1, // 10% of transactions
replaysSessionSampleRate: 0.1, // 10% of sessions
```

### Missing User Context

**Check**: User context is set after authentication:

```typescript
// Should be called in AuthContext
setSentryUser({
  id: user.id,
  email: user.email,
});
```

### Source Maps Not Working

**Solution**: Configure Vite plugin in `vite.config.ts`:

```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true,
  },
});
```

---

## Error Categories Reference

| Category | Usage | Example |
|----------|-------|---------|
| `blockchain` | Smart contract interactions | Transaction failures, wallet errors |
| `database` | Supabase queries | Query errors, connection issues |
| `storage` | File uploads/downloads | IPFS uploads, Supabase storage |
| `api` | External API calls | Third-party API failures |
| `auth` | Authentication | Login/logout errors |
| `ui` | React component errors | Render errors, state issues |
| `async` | Async operations | Promise rejections |
| `timeout` | Operation timeouts | Slow API responses |
| `retry-failed` | Failed retries | Max retries exceeded |
| `batch` | Batch processing | Bulk operations |

---

## Severity Levels

| Level | When to Use |
|-------|-------------|
| `fatal` | Critical errors requiring immediate attention |
| `error` | Standard errors that should be fixed |
| `warning` | Non-critical issues, degraded functionality |
| `info` | Informational messages |
| `debug` | Debugging information (development only) |

---

## Integration Checklist

- [x] Sentry SDK installed (`@sentry/react`, `@sentry/vite-plugin`)
- [x] DSN configured in `.env`
- [x] Sentry initialized in `main.tsx`
- [x] Global error boundary in `App.tsx`
- [x] Supabase error tracking configured
- [x] Auth context tracking user sessions
- [x] Error overlay UI with report functionality
- [x] Async error handlers available
- [x] Documentation complete

---

## Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Error Boundary Best Practices](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**Last Updated**: February 2025  
**Version**: 1.0.0
