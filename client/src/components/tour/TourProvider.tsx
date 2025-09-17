import { useState, useEffect, useCallback, ReactNode } from 'react';
import { TourContext, TourState, TourStep, TourContextType } from '@/hooks/useTour';

interface TourProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'venzip-tour-data';

const initialState: TourState = {
  isActive: false,
  currentStep: 0,
  totalSteps: 0,
  completedTours: [],
  currentTourId: null,
  userPreferences: {
    autoStart: true,
    skipTutorials: false,
    hasSeenWelcome: false,
  },
};

export function TourProvider({ children }: TourProviderProps) {
  const [state, setState] = useState<TourState>(initialState);
  const [currentSteps, setCurrentSteps] = useState<TourStep[]>([]);

  // Load tour data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedData = JSON.parse(saved);
        setState(prevState => ({
          ...prevState,
          completedTours: parsedData.completedTours || [],
          userPreferences: {
            ...prevState.userPreferences,
            ...parsedData.userPreferences,
          },
        }));
      }
    } catch (error) {
      console.warn('Failed to load tour data from localStorage:', error);
    }
  }, []);

  // Save tour data to localStorage whenever state changes
  useEffect(() => {
    try {
      const dataToSave = {
        completedTours: state.completedTours,
        userPreferences: state.userPreferences,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save tour data to localStorage:', error);
    }
  }, [state.completedTours, state.userPreferences]);

  const startTour = useCallback((tourId: string, steps: TourStep[]) => {
    // Don't start if user has disabled tutorials or already completed this tour
    if (state.userPreferences.skipTutorials || state.completedTours.includes(tourId)) {
      return;
    }

    setCurrentSteps(steps);
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0,
      totalSteps: steps.length,
      currentTourId: tourId,
    }));
  }, [state.userPreferences.skipTutorials, state.completedTours]);

  const nextStep = useCallback(() => {
    setState(prev => {
      const nextStepIndex = prev.currentStep + 1;
      
      if (nextStepIndex >= prev.totalSteps) {
        // Tour completed
        const newCompletedTours = prev.currentTourId 
          ? [...prev.completedTours, prev.currentTourId]
          : prev.completedTours;
        
        return {
          ...prev,
          isActive: false,
          currentStep: 0,
          totalSteps: 0,
          currentTourId: null,
          completedTours: newCompletedTours,
        };
      }
      
      return {
        ...prev,
        currentStep: nextStepIndex,
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  const skipTour = useCallback(() => {
    setState(prev => {
      const newCompletedTours = prev.currentTourId 
        ? [...prev.completedTours, prev.currentTourId]
        : prev.completedTours;
      
      return {
        ...prev,
        isActive: false,
        currentStep: 0,
        totalSteps: 0,
        currentTourId: null,
        completedTours: newCompletedTours,
      };
    });
  }, []);

  const endTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentStep: 0,
      totalSteps: 0,
      currentTourId: null,
    }));
    setCurrentSteps([]);
  }, []);

  const setUserPreference = useCallback((key: keyof TourState['userPreferences'], value: boolean) => {
    setState(prev => ({
      ...prev,
      userPreferences: {
        ...prev.userPreferences,
        [key]: value,
      },
    }));
  }, []);

  const markTourCompleted = useCallback((tourId: string) => {
    setState(prev => ({
      ...prev,
      completedTours: prev.completedTours.includes(tourId) 
        ? prev.completedTours 
        : [...prev.completedTours, tourId],
    }));
  }, []);

  const isTourCompleted = useCallback((tourId: string) => {
    return state.completedTours.includes(tourId);
  }, [state.completedTours]);

  const getCurrentStep = useCallback(() => {
    if (!state.isActive || currentSteps.length === 0) {
      return null;
    }
    return currentSteps[state.currentStep] || null;
  }, [state.isActive, state.currentStep, currentSteps]);

  const contextValue: TourContextType = {
    state,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    endTour,
    setUserPreference,
    markTourCompleted,
    isTourCompleted,
    getCurrentStep,
  };

  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
}