
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

    console.log('🎯 Tour initializer conditions met, checking page readiness...');
    
    // Check if essential page elements are loaded before starting tour
    const checkPageReady = () => {
      const essentialElements = [
        'main', // Main content area
        '.glass-card', // At least one card component
        // We'll be more lenient about specific elements since tour handles missing ones gracefully
      ];
      
      const elementsFound = essentialElements.every(selector => 
        document.querySelector(selector) !== null
      );
      
      if (elementsFound) {
        console.log('🎯 Page elements ready, starting tour');
        startTour('main-platform-tour', mainTourSteps);
        return true;
      }
      return false;
    };
    
    // Start tour automatically for new users after ensuring page is ready
    const timer = setTimeout(() => {
      // Double-check conditions before starting (state might have changed)
      if (
        state.userPreferences.autoStart && 
        !state.userPreferences.hasSeenWelcome && 
        !state.isActive &&
        !isTourCompleted('main-platform-tour')
      ) {
        if (!checkPageReady()) {
          // Try again after a shorter delay
          setTimeout(() => {
            if (checkPageReady()) {
              console.log('🎯 Starting tour after retry');
            } else {
              console.log('🎯 Page elements not ready, starting tour anyway with graceful fallbacks');
              startTour('main-platform-tour', mainTourSteps);
            }
          }, 2000);
        }
      } else {
        console.log('🎯 Tour start conditions no longer met, skipping');
      }
    }, 3000); // Reduced delay since we check for readiness

    return () => clearTimeout(timer);
  }, [user, location, state.isActive, state.userPreferences.autoStart, state.userPreferences.hasSeenWelcome, state.userPreferences.skipTutorials, startTour, isTourCompleted]);

  // This component doesn't render anything
  return null;
}
