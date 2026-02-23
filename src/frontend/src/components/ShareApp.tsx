import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Share2, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ShareAppProps {
  highlighted?: boolean;
}

export default function ShareApp({ highlighted = false }: ShareAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl = window.location.origin;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      toast.success('✅ Link copied! Share it with your family.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={highlighted ? 'default' : 'outline'} 
          size="sm" 
          className={`gap-2 relative ${
            highlighted 
              ? 'bg-warm-500 hover:bg-warm-600 animate-pulse shadow-lg' 
              : ''
          }`}
        >
          {highlighted && (
            <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-400" />
          )}
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Invite Family</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Invite Your Family 👨‍👩‍👧‍👦</DialogTitle>
          <DialogDescription className="text-base">
            Share this link with your family members to connect on FamilyConnect.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Your Invitation Link</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-3 bg-warm-50 dark:bg-warm-900/30 border border-warm-200 dark:border-warm-700 rounded-lg text-sm font-mono break-all">
                {appUrl}
              </code>
              <Button
                variant="default"
                size="lg"
                onClick={handleCopyLink}
                className="shrink-0 bg-warm-500 hover:bg-warm-600 px-6"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-warm-50 dark:bg-warm-900/30 border border-warm-200 dark:border-warm-700 rounded-lg p-4 space-y-3">
            <p className="font-semibold text-warm-900 dark:text-warm-100 flex items-center gap-2">
              <span className="text-lg">📋</span>
              How it works:
            </p>
            <ol className="space-y-2 text-sm text-warm-700 dark:text-warm-300">
              <li className="flex gap-2">
                <span className="font-bold text-warm-600">1.</span>
                <span>Copy and share the link above with your family members</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-warm-600">2.</span>
                <span>They'll create their account and choose their role (Parent or Child)</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-warm-600">3.</span>
                <span>Connect with them in Settings to start sharing as a family!</span>
              </li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
