
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
    
    // Don't start if user has already seen the welcome tour or completed the main tour
    if (state.userPreferences.hasSeenWelcome || isTourCompleted('main-platform-tour')) return;

    // Don't start if autoStart is disabled
    if (!state.userPreferences.autoStart) return;

    console.log('🎯 Tour initializer conditions met, starting tour in 2 seconds');
    
    // Start tour automatically for new users after a delay to ensure page is loaded
    const timer = setTimeout(() => {
      // Double-check conditions before starting (state might have changed)
      if (
        state.userPreferences.autoStart && 
        !state.userPreferences.hasSeenWelcome && 
        !state.isActive &&
        !isTourCompleted('main-platform-tour')
      ) {
        console.log('🎯 Starting automatic tour for new user');
        startTour('main-platform-tour', mainTourSteps);
      } else {
        console.log('🎯 Tour start conditions no longer met, skipping');
      }
    }, 3000); // 3 second delay to ensure page elements are fully rendered

    return () => clearTimeout(timer);
  }, [user, location, state.isActive, state.userPreferences.autoStart, state.userPreferences.hasSeenWelcome, state.userPreferences.skipTutorials, startTour, isTourCompleted]);

  // This component doesn't render anything
  return null;
}
