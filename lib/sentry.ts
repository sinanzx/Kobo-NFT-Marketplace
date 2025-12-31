/**
 * Sentry Error Tracking Configuration
 * Monitors application errors and performance
 */

import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.MODE;
const RELEASE = import.meta.env.VITE_APP_VERSION || 'development';

/**
 * Initialize Sentry error tracking
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    release: RELEASE,
    
    // Performance Monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],

    // Performance traces sample rate
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session Replay sample rate
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Filter out known errors
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Filter out wallet connection errors (user-initiated)
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();
        if (
          message.includes('user rejected') ||
          message.includes('user denied') ||
          message.includes('user cancelled')
        ) {
          return null;
        }
      }

      // Filter out network errors from IPFS gateways (expected)
      if (event.request?.url?.includes('ipfs.io') || event.request?.url?.includes('gateway.pinata.cloud')) {
        return null;
      }

      return event;
    },

    // Add custom tags
    initialScope: {
      tags: {
        'app.version': RELEASE,
        'app.environment': ENVIRONMENT,
      },
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Capture custom error with context
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture custom message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Track blockchain transaction
 */
export function trackTransaction(txHash: string, action: string, metadata?: Record<string, unknown>) {
  addBreadcrumb(`Transaction ${action}`, 'blockchain', {
    txHash,
    action,
    ...metadata,
  });
}

/**
 * Track IPFS upload
 */
export function trackIPFSUpload(ipfsHash: string, type: 'media' | 'metadata', metadata?: Record<string, unknown>) {
  addBreadcrumb(`IPFS upload: ${type}`, 'ipfs', {
    ipfsHash,
    type,
    ...metadata,
  });
}

/**
 * Track AI generation
 */
export function trackAIGeneration(model: string, prompt: string, success: boolean) {
  addBreadcrumb('AI generation', 'ai', {
    model,
    promptLength: prompt.length,
    success,
  });
}

/**
 * Performance monitoring wrapper
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  return Sentry.startSpan({ name }, () => {
    return fn();
  });
}

/**
 * Async performance monitoring wrapper
 */
export async function measurePerformanceAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan({ name }, async () => {
    return await fn();
  });
}

export default Sentry;
