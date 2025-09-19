
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTour } from '@/hooks/useTour';
import { mainTourSteps } from './tourSteps';
import { useAuth } from '@/hooks/useAuth';

export function TourInitializer() {
  const [location] = useLocation();
  const { state, startTour, isTourCompleted } = useTour();
  const { user } = useAuth();

  useEffect(() => {
    // Only run for authenticated users on dashboard
    if (!user || location !== '/dashboard') return;
    
    // Don't start if tour is already active or user has disabled tutorials
    if (state.isActive || state.userPreferences.skipTutorials) return;
    
    // Don't start if user has already seen the welcome tour
    if (state.userPreferences.hasSeenWelcome || isTourCompleted('main-platform-tour')) return;

    // Start tour automatically for new users after a short delay to ensure page is loaded
    const timer = setTimeout(() => {
      if (state.userPreferences.autoStart && !state.userPreferences.hasSeenWelcome) {
        console.log('🎯 Starting automatic tour for new user');
        startTour('main-platform-tour', mainTourSteps);
      }
    }, 2000); // 2 second delay to ensure page elements are rendered

    return () => clearTimeout(timer);
  }, [user, location, state, startTour, isTourCompleted]);

  // This component doesn't render anything
  return null;
}
