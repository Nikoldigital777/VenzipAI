import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTour } from '@/hooks/useTour';

interface TourStepProps {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showSkip?: boolean;
  offset?: number;
  navigateTo?: string;
  fallbackTarget?: string;
  onBeforeStep?: () => void;
  onAfterStep?: () => void;
}

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourStep({ 
  target, 
  title, 
  content, 
  placement = 'bottom', 
  showSkip = true,
  offset = 10,
  navigateTo,
  fallbackTarget,
  onBeforeStep,
  onAfterStep
}: TourStepProps) {
  const { state, nextStep, previousStep, skipTour, endTour } = useTour();
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle navigation if specified
  useEffect(() => {
    if (navigateTo) {
      // Import navigate from wouter (correct import path)
      import('wouter').then(({ navigate }) => {
        navigate(navigateTo);
      });
    }
    
    // Execute before step callback
    onBeforeStep?.();
    
    return () => {
      // Execute after step callback on cleanup
      onAfterStep?.();
    };
  }, [navigateTo, onBeforeStep, onAfterStep]);

  // Calculate target element position and highlight
  useEffect(() => {
    let targetElement = document.querySelector(target) as HTMLElement;
    
    // Try fallback target if primary target not found
    if (!targetElement && fallbackTarget) {
      targetElement = document.querySelector(fallbackTarget) as HTMLElement;
      console.log(`Primary target ${target} not found, using fallback: ${fallbackTarget}`);
    }
    
    if (!targetElement) {
      console.warn(`Tour target not found: ${target}${fallbackTarget ? ` (fallback: ${fallbackTarget})` : ''}`);
      // Auto-advance tour after a timeout if target is missing
      const timeout = setTimeout(() => {
        console.log(`Auto-advancing tour due to missing target: ${target}`);
        nextStep();
      }, 2000);
      return () => clearTimeout(timeout);
    }

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      // Use viewport coordinates for fixed positioning (no scroll offset needed)
      setTargetPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();
    
    // Scroll target into view if it's not visible
    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center' 
    });

    // Update position on scroll and resize
    const handleUpdate = () => requestAnimationFrame(updatePosition);
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [target]);

  // Calculate popover position based on target position and placement
  useEffect(() => {
    if (!targetPosition || !popoverRef.current) return;

    const popoverRect = popoverRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = targetPosition.top - popoverRect.height - offset;
        left = targetPosition.left + (targetPosition.width / 2) - (popoverRect.width / 2);
        break;
      case 'bottom':
        top = targetPosition.top + targetPosition.height + offset;
        left = targetPosition.left + (targetPosition.width / 2) - (popoverRect.width / 2);
        break;
      case 'left':
        top = targetPosition.top + (targetPosition.height / 2) - (popoverRect.height / 2);
        left = targetPosition.left - popoverRect.width - offset;
        break;
      case 'right':
        top = targetPosition.top + (targetPosition.height / 2) - (popoverRect.height / 2);
        left = targetPosition.left + targetPosition.width + offset;
        break;
      case 'center':
        top = (viewportHeight / 2) - (popoverRect.height / 2);
        left = (viewportWidth / 2) - (popoverRect.width / 2);
        break;
    }

    // Ensure popover stays within viewport bounds (using viewport coordinates)
    left = Math.max(offset, Math.min(left, viewportWidth - popoverRect.width - offset));
    top = Math.max(offset, Math.min(top, viewportHeight - popoverRect.height - offset));

    setPopoverPosition({ top, left });
  }, [targetPosition, placement, offset]);

  const progress = ((state.currentStep + 1) / state.totalSteps) * 100;

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        endTour();
        break;
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextStep();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (state.currentStep > 0) {
          previousStep();
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.currentStep]);

  if (!state.isActive || !targetPosition) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with spotlight effect */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          background: `
            radial-gradient(
              ellipse ${targetPosition.width + 20}px ${targetPosition.height + 20}px at 
              ${targetPosition.left + targetPosition.width / 2}px 
              ${targetPosition.top + targetPosition.height / 2}px,
              transparent 0%,
              transparent 40%,
              rgba(0, 0, 0, 0.7) 70%,
              rgba(0, 0, 0, 0.8) 100%
            )
          `
        }}
        onClick={endTour}
      />
      
      {/* Highlighted target border */}
      <div
        className="absolute border-4 border-venzip-primary rounded-lg shadow-lg shadow-venzip-primary/30 animate-pulse"
        style={{
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
          pointerEvents: 'none',
        }}
      />

      {/* Tour popover */}
      <Card
        ref={popoverRef}
        className="absolute glass-card border-2 border-venzip-primary/20 shadow-2xl max-w-sm w-full mx-4"
        style={{
          top: popoverPosition.top,
          left: popoverPosition.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={endTour}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              data-testid="tour-close-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Step {state.currentStep + 1} of {state.totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-gray-700 leading-relaxed mb-6 text-sm">
            {content}
          </p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {state.currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  className="flex items-center gap-2"
                  data-testid="tour-previous-button"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {showSkip && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                  data-testid="tour-skip-button"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip Tour
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={nextStep}
                className="flex items-center gap-2 bg-venzip-primary hover:bg-venzip-primary/90"
                data-testid="tour-next-button"
              >
                {state.currentStep === state.totalSteps - 1 ? 'Finish' : 'Next'}
                {state.currentStep < state.totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}