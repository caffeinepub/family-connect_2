import { useState, useEffect } from 'react';

type OnboardingStep = 
  | 'roleSelection'
  | 'firstFamilyConnection'
  | 'firstDashboardVisit'
  | 'shareButtonHighlight';

interface OnboardingState {
  [key: string]: boolean;
}

const STORAGE_KEY = 'familyconnect_onboarding';

/**
 * Custom hook to manage onboarding state across the application
 */
export function useOnboarding() {
  const [completedSteps, setCompletedSteps] = useState<OnboardingState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, [completedSteps]);

  const markStepComplete = (step: OnboardingStep) => {
    setCompletedSteps(prev => ({ ...prev, [step]: true }));
  };

  const isStepComplete = (step: OnboardingStep): boolean => {
    return completedSteps[step] === true;
  };

  const shouldShowGuidance = (step: OnboardingStep): boolean => {
    return !isStepComplete(step);
  };

  const resetOnboarding = () => {
    setCompletedSteps({});
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    markStepComplete,
    isStepComplete,
    shouldShowGuidance,
    resetOnboarding,
  };
}
