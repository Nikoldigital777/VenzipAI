import { createContext, useContext } from 'react';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'navigate' | 'wait';
  prerequisites?: string[];
  disableBeacon?: boolean;
  showSkip?: boolean;
  offset?: number;
  // Enhanced tour functionality
  navigateTo?: string;
  fallbackTarget?: string;
  skipCondition?: () => boolean;
  onBeforeStep?: () => void;
  onAfterStep?: () => void;
}

export interface TourState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  completedTours: string[];
  currentTourId: string | null;
  isNavigating?: boolean;
  userPreferences: {
    autoStart: boolean;
    skipTutorials: boolean;
    hasSeenWelcome: boolean;
  };
}

export interface TourContextType {
  state: TourState;
  startTour: (tourId: string, steps: TourStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  endTour: () => void;
  setUserPreference: (key: keyof TourState['userPreferences'], value: boolean) => void;
  markTourCompleted: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  getCurrentStep: () => TourStep | null;
}

export const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};