import { useTour } from '@/hooks/useTour';
import { TourStep } from './TourStep';
import { memo } from 'react';

function TourGuideComponent() {
  const { state, getCurrentStep } = useTour();
  
  if (!state.isActive) {
    return null;
  }

  const currentStep = getCurrentStep();
  if (!currentStep) {
    return null;
  }

  return (
    <TourStep
      target={currentStep.target}
      title={currentStep.title}
      content={currentStep.content}
      placement={currentStep.placement}
      showSkip={currentStep.showSkip}
      offset={currentStep.offset}
      navigateTo={currentStep.navigateTo}
      fallbackTarget={currentStep.fallbackTarget}
      onBeforeStep={currentStep.onBeforeStep}
      onAfterStep={currentStep.onAfterStep}
    />
  );
}

// Memoize the component to prevent unnecessary re-renders
export const TourGuide = memo(TourGuideComponent);