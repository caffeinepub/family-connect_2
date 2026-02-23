import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface SwipeConfig {
  threshold?: number;
  enabled?: boolean;
}

export function useSwipeNavigation(config: SwipeConfig = {}) {
  const { threshold = 100, enabled = true } = config;
  const navigate = useNavigate();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const swipeDistance = touchEndX.current - touchStartX.current;

      // Swipe right (back navigation)
      if (swipeDistance > threshold) {
        console.log('[Swipe] Back navigation triggered');
        navigate({ to: -1 as any });
      }

      // Reset values
      touchStartX.current = 0;
      touchEndX.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, navigate]);

  return null;
}
