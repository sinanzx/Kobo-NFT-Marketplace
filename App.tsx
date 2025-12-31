import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { NetworkGuard } from '@/components/NetworkGuard';
import { TransactionMonitor, ToastProvider } from '@/components/TransactionMonitor';

import { lazy, Suspense, useEffect } from 'react';
import { SkipLinks } from '@/components/SkipLinks';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { useGlobalKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import CookieConsent from '@/components/CookieConsent';

// Eager load critical routes
import Homepage from './pages/Homepage';
import Login from './pages/Login';

// Lazy load non-critical routes for code splitting
const Index = lazy(() => import('./pages/Index'));
const Create = lazy(() => import('./pages/create'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Battles = lazy(() => import('./pages/Battles'));
const Collaborations = lazy(() => import('./pages/Collaborations'));
const ARViewerPage = lazy(() => import('./pages/ARViewer'));
const TraitMarketplace = lazy(() => import('./pages/TraitMarketplace'));
const DAO = lazy(() => import('./pages/DAO'));
const Provenance = lazy(() => import('./pages/Provenance'));
const Placeholder = lazy(() => import('./pages/Placeholder'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Gifts = lazy(() => import('./pages/Gifts'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Licenses = lazy(() => import('./pages/Licenses'));
const Cookies = lazy(() => import('./pages/Cookies'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));

// Loading component with smooth CSS animation
const PageLoader = () => (
  <div
    className="min-h-screen bg-gray-950 flex items-center justify-center animate-fade-in"
    role="status"
    aria-live="polite"
    aria-label="Loading page content"
  >
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-pulse-ring" />
        <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
      <p className="text-white/70 text-sm animate-pulse">
        Loading...
      </p>
    </div>
  </div>
);

const AppContent = () => {
  useGlobalKeyboardShortcuts();

  // TODO: Replace with actual marketplace contract address from metadata.json
  // const marketplaceAddress = '0x...' as `0x${string}`;
  const marketplaceAddress = undefined; // Set this when marketplace is deployed

  return (
    <>
      <SkipLinks />
      <ToastProvider />
      <TransactionMonitor marketplaceAddress={marketplaceAddress} enabled={!!marketplaceAddress} />
      <NetworkGuard>
        <MainNavigation />
        <Suspense fallback={<PageLoader />}>
            <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create" element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            } />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/battles" element={<Battles />} />
            <Route path="/collaborations" element={<Collaborations />} />
            <Route path="/ar-viewer" element={<ARViewerPage />} />
            <Route path="/marketplace" element={<TraitMarketplace />} />
            <Route path="/trait-marketplace" element={<TraitMarketplace />} />
            <Route path="/dao" element={<DAO />} />
            <Route path="/provenance" element={<Provenance />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/gifts" element={
              <ProtectedRoute>
                <Gifts />
              </ProtectedRoute>
            } />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/licenses" element={<Licenses />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/account-settings" element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
      </NetworkGuard>
    </>
  );
};

const App = () => (
  <ErrorBoundary showDetails={import.meta.env.DEV}>
    <TooltipProvider>
      <Toaster />
      <KeyboardShortcutsModal />
      <CookieConsent />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
