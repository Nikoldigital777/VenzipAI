import { TourStep } from '@/hooks/useTour';

// Tour configuration validation and management
export interface TourConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: TourStep[];
  metadata: {
    estimatedDuration: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: 'onboarding' | 'feature' | 'workflow' | 'help';
    prerequisites: string[];
    targetAudience: string[];
  };
  conditions: {
    showWhen?: () => boolean;
    skipWhen?: () => boolean;
    requiresAuth?: boolean;
    minimumUserLevel?: string;
  };
}

export class TourConfigManager {
  private configs: Map<string, TourConfig> = new Map();
  private validationErrors: string[] = [];

  // Register a tour configuration
  registerTour(config: TourConfig): boolean {
    const isValid = this.validateTourConfig(config);
    if (isValid) {
      this.configs.set(config.id, config);
      console.log(`✅ Tour registered: ${config.name} (${config.steps.length} steps)`);
      return true;
    }
    console.error(`❌ Failed to register tour: ${config.name}`, this.validationErrors);
    return false;
  }

  // Get tour configuration by ID
  getTourConfig(tourId: string): TourConfig | null {
    return this.configs.get(tourId) || null;
  }

  // Get all available tours
  getAllTours(): TourConfig[] {
    return Array.from(this.configs.values());
  }

  // Get tours by category
  getToursByCategory(category: TourConfig['metadata']['category']): TourConfig[] {
    return this.getAllTours().filter(tour => tour.metadata.category === category);
  }

  // Validate tour configuration
  private validateTourConfig(config: TourConfig): boolean {
    this.validationErrors = [];

    // Basic validation
    if (!config.id) this.validationErrors.push('Tour ID is required');
    if (!config.name) this.validationErrors.push('Tour name is required');
    if (!config.steps || config.steps.length === 0) {
      this.validationErrors.push('Tour must have at least one step');
    }

    // Step validation
    config.steps.forEach((step, index) => {
      this.validateTourStep(step, index);
    });

    // Dependency validation
    this.validateStepDependencies(config.steps);

    return this.validationErrors.length === 0;
  }

  // Validate individual tour step
  private validateTourStep(step: TourStep, index: number): void {
    const stepPrefix = `Step ${index + 1}:`;
    
    if (!step.target) {
      this.validationErrors.push(`${stepPrefix} Target selector is required`);
    }
    if (!step.title) {
      this.validationErrors.push(`${stepPrefix} Title is required`);
    }
    if (!step.content) {
      this.validationErrors.push(`${stepPrefix} Content is required`);
    }

    // Validate target selector format
    if (step.target && !this.isValidSelector(step.target)) {
      this.validationErrors.push(`${stepPrefix} Invalid target selector: ${step.target}`);
    }

    // Validate fallback target if provided
    if (step.fallbackTarget && !this.isValidSelector(step.fallbackTarget)) {
      this.validationErrors.push(`${stepPrefix} Invalid fallback target: ${step.fallbackTarget}`);
    }
  }

  // Validate step dependencies
  private validateStepDependencies(steps: TourStep[]): void {
    steps.forEach((step, index) => {
      if (step.prerequisites) {
        step.prerequisites.forEach(prereq => {
          // Check if prerequisite exists as a data-testid in previous steps
          const prereqExists = steps.slice(0, index).some(prevStep => 
            prevStep.target.includes(prereq) || 
            (prevStep.fallbackTarget && prevStep.fallbackTarget.includes(prereq))
          );
          
          if (!prereqExists) {
            this.validationErrors.push(
              `Step ${index + 1}: Prerequisite "${prereq}" not found in previous steps`
            );
          }
        });
      }
    });
  }

  // Check if a CSS selector is valid
  private isValidSelector(selector: string): boolean {
    try {
      document.querySelector(selector);
      return true;
    } catch {
      // Allow common patterns even if element doesn't exist yet
      const validPatterns = [
        /^\[data-testid=".+"\]$/,
        /^#[a-zA-Z0-9_-]+$/,
        /^\.[a-zA-Z0-9_-]+$/,
        /^[a-zA-Z0-9_-]+$/,
        /^\[data-sidebar[="].*\]$/
      ];
      
      return validPatterns.some(pattern => pattern.test(selector));
    }
  }

  // Check if tour should be shown based on conditions
  shouldShowTour(tourId: string): boolean {
    const config = this.getTourConfig(tourId);
    if (!config) return false;

    const { conditions } = config;

    // Check authentication requirement
    if (conditions.requiresAuth) {
      // Add your auth check logic here
      const isAuthenticated = localStorage.getItem('user') !== null;
      if (!isAuthenticated) return false;
    }

    // Check custom show condition
    if (conditions.showWhen && !conditions.showWhen()) {
      return false;
    }

    // Check skip condition
    if (conditions.skipWhen && conditions.skipWhen()) {
      return false;
    }

    return true;
  }

  // Get validation errors
  getValidationErrors(): string[] {
    return [...this.validationErrors];
  }
}

// Global tour configuration manager instance
export const tourConfigManager = new TourConfigManager();

// Tour completion tracking
export class TourCompletionTracker {
  private readonly STORAGE_KEY = 'venzip_tour_completion';
  
  // Track tour completion
  markTourCompleted(tourId: string): void {
    const completions = this.getCompletions();
    completions[tourId] = {
      completedAt: new Date().toISOString(),
      version: this.getTourVersion(tourId)
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completions));
  }

  // Check if tour is completed
  isTourCompleted(tourId: string): boolean {
    const completions = this.getCompletions();
    return !!completions[tourId];
  }

  // Get all completions
  getCompletions(): Record<string, { completedAt: string; version: string }> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Reset tour completion (for testing or reset functionality)
  resetTourCompletion(tourId: string): void {
    const completions = this.getCompletions();
    delete completions[tourId];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completions));
  }

  // Get tour version for completion tracking
  private getTourVersion(tourId: string): string {
    const config = tourConfigManager.getTourConfig(tourId);
    return config?.version || '1.0.0';
  }

  // Check if tour needs to be shown again due to version update
  needsUpdate(tourId: string): boolean {
    const completion = this.getCompletions()[tourId];
    if (!completion) return true;

    const currentVersion = this.getTourVersion(tourId);
    return completion.version !== currentVersion;
  }
}

// Global completion tracker instance
export const tourCompletionTracker = new TourCompletionTracker();