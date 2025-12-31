import { lazy } from 'react';

// Lazy load heavy components for code splitting
// Only include components that actually exist in the codebase
export const NFTGallery = lazy(() => import('@/components/collections/NFTGallery'));
