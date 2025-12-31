import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '@/components/homepage/Hero';
import { HowItWorks } from '@/components/homepage/HowItWorks';
import { Ecosystem } from '@/components/homepage/Ecosystem';
import { TraitLiquidity } from '@/components/homepage/TraitLiquidity';
import { ProtocolSpecs } from '@/components/homepage/ProtocolSpecs';
import { NFTCarousel } from '@/components/homepage/NFTCarousel';
import { FinalCTA } from '@/components/homepage/FinalCTA';
import { Footer } from '@/components/homepage/Footer';
import { FeatureTour } from '@/components/onboarding/FeatureTour';
import { useFeatureTour, TourStep } from '@/hooks/useFeatureTour';

export default function Homepage() {
  const navigate = useNavigate();

  // Dark Industrial theme enforced via global CSS

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      target: '[data-tour="hero"]',
      title: 'Welcome to Kōbo NFT!',
      description: 'Discover AI-powered NFT creation with provenance tracking and social features.',
      position: 'bottom',
    },
    {
      id: 'create',
      target: '[data-tour="create-button"]',
      title: 'Create Your First NFT',
      description: 'Use AI to generate unique NFTs or upload your own artwork. Get started in seconds!',
      position: 'bottom',
      action: {
        label: 'Start Creating',
        onClick: () => navigate('/create'),
      },
    },
  ];

  const tour = useFeatureTour(tourSteps);

  // Auto-start tour for first-time visitors after onboarding
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('kobo_onboarding_completed') === 'true';
    const tourCompleted = localStorage.getItem('kobo_feature_tour_completed') === 'true';
    const tourDismissed = localStorage.getItem('kobo_feature_tour_dismissed') === 'true';

    if (onboardingCompleted && !tourCompleted && !tourDismissed) {
      // Delay tour start to allow page to render
      const timer = setTimeout(() => {
        tour.startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" role="main">
        <div data-tour="hero">
          <Hero />
        </div>
        <div className="pt-[120px]">
          <HowItWorks />
        </div>
        <div className="pt-[120px]">
          <Ecosystem />
        </div>
        <div className="pt-[120px]">
          <TraitLiquidity />
        </div>
        <div className="pt-[120px]">
          <ProtocolSpecs />
        </div>
        <div className="pt-[120px]">
          <NFTCarousel />
        </div>
        <div className="pt-[120px]">
          <FinalCTA />
        </div>
      </main>
      <Footer />

      {/* Feature Tour */}
      <FeatureTour
        isActive={tour.isActive}
        currentStep={tour.currentStep}
        currentStepData={tour.currentStepData}
        totalSteps={tour.totalSteps}
        onNext={tour.nextStep}
        onPrev={tour.prevStep}
        onSkip={tour.skipTour}
      />
    </div>
  );
}
