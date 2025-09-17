import { useTour } from '@/hooks/useTour';
import { TourStep } from './TourStep';

export function TourGuide() {
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
    />
  );
}