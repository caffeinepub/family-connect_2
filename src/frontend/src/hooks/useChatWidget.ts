import { useState, useEffect } from 'react';

const WIDGET_POSITION_KEY = 'chatWidgetPosition';
const WIDGET_OPEN_KEY = 'chatWidgetOpen';

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(() => {
    const stored = localStorage.getItem(WIDGET_OPEN_KEY);
    return stored === 'true';
  });

  const [position, setPosition] = useState(() => {
    const stored = localStorage.getItem(WIDGET_POSITION_KEY);
    return stored ? parseInt(stored, 10) : 50; // Default to 50% from left
  });

  useEffect(() => {
    localStorage.setItem(WIDGET_OPEN_KEY, isOpen.toString());
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem(WIDGET_POSITION_KEY, position.toString());
  }, [position]);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    position,
    setPosition,
    toggle,
    open,
    close,
  };
}
