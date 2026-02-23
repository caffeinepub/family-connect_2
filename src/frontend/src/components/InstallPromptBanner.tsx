import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { Button } from './ui/button';
import { Download, X } from 'lucide-react';

export default function InstallPromptBanner() {
  const { isInstallable, showPrompt, dismissPrompt } = useInstallPrompt();

  if (!isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-bottom">
      <div className="bg-gradient-to-r from-warm-500 to-warm-600 rounded-2xl shadow-2xl p-4 border border-warm-400">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">Install FamilyConnect</h3>
            <p className="text-white/90 text-xs mt-1">
              Add to your home screen for quick access and offline support
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={showPrompt}
                className="bg-white text-warm-600 hover:bg-white/90 font-medium"
              >
                Install
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissPrompt}
                className="text-white hover:bg-white/10"
              >
                Not now
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1 text-white hover:bg-white/10"
            onClick={dismissPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
