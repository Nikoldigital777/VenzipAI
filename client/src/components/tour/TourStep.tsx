import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, SkipForward, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore keyboard events when user is typing in input fields
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.contentEditable === 'true' ||
                        target.isContentEditable;
    
    if (isInputField) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
      case ' ': // Fixed: use ' ' instead of 'Space'
      case 'Enter':
        event.preventDefault();
        nextStep();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (state.currentStep > 0) previousStep();
        break;
      case 'Escape':
        event.preventDefault();
        if (showSkip) {
          setShowSkipConfirm(true);
        } else {
          endTour();
        }
        break;
    }
  }, [nextStep, previousStep, endTour, showSkip, state.currentStep]);

  // Handle step lifecycle callbacks
  useEffect(() => {
    // Execute before step callback
    onBeforeStep?.();
    
    return () => {
      // Execute after step callback on cleanup
      onAfterStep?.();
    };
  }, [onBeforeStep, onAfterStep]);
  
  // Setup keyboard navigation
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Animation control
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Calculate target element position and highlight
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 15;
    const retryDelay = 300;
    let autoAdvanceTimeout: NodeJS.Timeout | null = null;

    const findTargetElement = (): HTMLElement | null => {
      let targetElement = document.querySelector(target) as HTMLElement;
      
      // Try fallback target if primary target not found
      if (!targetElement && fallbackTarget) {
        targetElement = document.querySelector(fallbackTarget) as HTMLElement;
        if (targetElement) {
          console.log(`Primary target ${target} not found, using fallback: ${fallbackTarget}`);
        }
      }
      
      // Try even more generic fallbacks for common cases
      if (!targetElement) {
        if (target.includes('sidebar')) {
          targetElement = document.querySelector('aside') || document.querySelector('[role="navigation"]') as HTMLElement;
        } else if (target.includes('button')) {
          targetElement = document.querySelector('button:last-of-type') as HTMLElement;
        } else if (target.includes('dashboard') || target.includes('overview')) {
          targetElement = document.querySelector('main') || document.querySelector('.container') as HTMLElement;
        }
        
        if (targetElement) {
          console.log(`Using generic fallback for ${target}`);
        }
      }
      
      return targetElement;
    };

    const attemptTargeting = () => {
      const targetElement = findTargetElement();
      
      if (!targetElement) {
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Tour target not found (attempt ${retryCount}/${maxRetries}): ${target}`);
          setTimeout(attemptTargeting, retryDelay);
          return;
        }
        
        console.warn(`Tour target not found after ${maxRetries} attempts: ${target}${fallbackTarget ? ` (fallback: ${fallbackTarget})` : ''}`);
        // Auto-advance tour after exhausting retries
        autoAdvanceTimeout = setTimeout(() => {
          console.log(`Auto-advancing tour due to missing target: ${target}`);
          nextStep();
        }, 1000);
        return;
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
      
      // Return cleanup function that removes the exact same listeners
      return () => {
        window.removeEventListener('scroll', handleUpdate);
        window.removeEventListener('resize', handleUpdate);
      };
    };

    // Start the targeting process
    attemptTargeting();

    return () => {
      // Clean up auto-advance timeout if it exists
      if (autoAdvanceTimeout) {
        clearTimeout(autoAdvanceTimeout);
      }
    };
  }, [target, nextStep, fallbackTarget]);

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


  if (!state.isActive || !targetPosition) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with crisp spotlight cutout effect */}
      <div 
        className="absolute inset-0 bg-black/80"
        style={{
          background: `
            radial-gradient(
              ellipse ${targetPosition.width + 40}px ${targetPosition.height + 40}px at 
              ${targetPosition.left + targetPosition.width / 2}px 
              ${targetPosition.top + targetPosition.height / 2}px,
              transparent 0%,
              transparent 35%,
              rgba(0, 0, 0, 0.1) 40%,
              rgba(0, 0, 0, 0.8) 65%,
              rgba(0, 0, 0, 0.9) 100%
            )
          `
        }}
        onClick={() => showSkip ? setShowSkipConfirm(true) : endTour()}
      />
      
      {/* Highlighted target border */}
      <div
        className="absolute border-4 border-venzip-primary rounded-lg shadow-xl shadow-venzip-primary/50 animate-pulse"
        style={{
          top: targetPosition.top - 6,
          left: targetPosition.left - 6,
          width: targetPosition.width + 12,
          height: targetPosition.height + 12,
          pointerEvents: 'none',
          boxShadow: `
            0 0 20px 4px rgba(78, 205, 196, 0.4),
            0 0 40px 8px rgba(78, 205, 196, 0.2),
            inset 0 0 20px 4px rgba(78, 205, 196, 0.1)
          `,
        }}
      />

      {/* Tour popover */}
      <Card
        ref={popoverRef}
        className={`absolute glass-card border-2 border-venzip-primary/20 shadow-2xl max-w-sm w-full mx-4 transition-all duration-300 ${
          isAnimating ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
        }`}
        style={{
          top: popoverPosition.top,
          left: popoverPosition.left,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-foreground leading-tight">
              {title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => showSkip ? setShowSkipConfirm(true) : endTour()}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              data-testid="tour-close-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {state.currentStep + 1} of {state.totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-foreground/80 leading-relaxed mb-6 text-sm">
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
                  onClick={() => setShowSkipConfirm(true)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
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

      {/* Skip Confirmation Dialog - Elevated above tour overlay */}
      <AlertDialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <AlertDialogContent 
          className="z-[10000] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]" 
          style={{ zIndex: 10000 }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Skip Tour?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the guided tour? The tour helps you understand how to use Venzip effectively and reduces the need to reach out for support.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowSkipConfirm(false)}
              data-testid="skip-cancel-button"
            >
              Continue Tour
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowSkipConfirm(false);
                skipTour();
              }}
              className="bg-red-600 hover:bg-red-700"
              data-testid="skip-confirm-button"
            >
              Yes, Cancel Tour
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>,
    document.body
  );
}