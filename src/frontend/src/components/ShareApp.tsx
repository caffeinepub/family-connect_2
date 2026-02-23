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
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 border-warm-300 hover:bg-warm-50 dark:hover:bg-warm-900 transition-all ${
            highlighted ? 'ring-2 ring-warm-500 ring-offset-2 animate-pulse bg-warm-100 dark:bg-warm-800' : ''
          }`}
        >
          {highlighted && <Sparkles className="h-4 w-4 text-warm-600" />}
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Share App</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Share FamilyConnect</DialogTitle>
          <DialogDescription>
            Invite your family members to join FamilyConnect and stay connected!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-warm-50 dark:bg-warm-900 p-4 rounded-lg border border-warm-200">
            <p className="text-sm font-medium mb-2 text-warm-900 dark:text-warm-100">How to invite family members:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Copy the app link below</li>
              <li>Share it with your family via text, email, or messaging app</li>
              <li>They'll create their account and connect with you!</li>
            </ol>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted px-3 py-2 rounded-md text-sm truncate border border-warm-200">
              {appUrl}
            </div>
            <Button
              onClick={handleCopyLink}
              size="sm"
              className="shrink-0 bg-warm-500 hover:bg-warm-600"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> After they sign up, you can connect as a family through the Settings page by generating an invitation link.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
