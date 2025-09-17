import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from '@/hooks/useTour';
import { mainTourSteps } from './tourSteps.js';

export function TourButton() {
  const { startTour, state } = useTour();

  const handleStartTour = () => {
    startTour('main-platform-tour', mainTourSteps);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStartTour}
      disabled={state.isActive}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
      data-testid="start-tour-button"
    >
      <HelpCircle className="h-4 w-4" />
      Take Tour
    </Button>
  );
}