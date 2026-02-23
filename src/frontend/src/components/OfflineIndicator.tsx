import { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Alert, AlertDescription } from './ui/alert';
import { WifiOff, X } from 'lucide-react';
import { Button } from './ui/button';

export default function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setIsDismissed(false);
    }
  }, [isOnline]);

  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top">
      <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 shadow-lg">
        <div className="flex items-start gap-3">
          <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1">
            <AlertDescription className="text-amber-900 dark:text-amber-100">
              <strong className="font-semibold">You're offline</strong>
              <p className="text-sm mt-1">
                Changes will sync automatically when your connection is restored.
              </p>
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1 hover:bg-amber-100 dark:hover:bg-amber-900"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}
