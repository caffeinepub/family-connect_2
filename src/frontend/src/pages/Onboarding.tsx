import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateProfile, useValidateFamilyInvitation } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Loader2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '../backend';

export default function Onboarding() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createProfile = useCreateProfile();
  const validateInvitation = useValidateFamilyInvitation();

  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child'>('parent');
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);

  const isAuthenticated = !!identity;

  // Check for invitation token in URL on mount
  useState(() => {
    const checkInvitationToken = async () => {
      if (!isAuthenticated || !identity) return;

      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite');

      if (inviteToken && !isProcessingInvite) {
        setIsProcessingInvite(true);
        console.log('🎟️ Found invitation token in URL:', inviteToken);

        try {
          const childPrincipal = identity.getPrincipal();
          await validateInvitation.mutateAsync({
            token: inviteToken,
            childPrincipal,
          });

          toast.success('Successfully connected to family!');
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error: any) {
          console.error('❌ Failed to validate invitation:', error);
          toast.error(error.message || 'Failed to validate invitation link');
        } finally {
          setIsProcessingInvite(false);
        }
      }
    };

    checkInvitationToken();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      const roleEnum: Role = selectedRole === 'parent' ? Role.parent : Role.child;
      
      await createProfile.mutateAsync({
        displayName: displayName.trim(),
        role: roleEnum,
      });
      
      toast.success('Profile created successfully!');
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('❌ Profile creation failed:', error);
      toast.error(error.message || 'Failed to create profile');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to continue</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-warm-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-warm-500 to-warm-600 p-4 rounded-2xl shadow-md">
              <Heart className="h-12 w-12 text-white" fill="white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to FamilyConnect!</CardTitle>
          <CardDescription>
            Let's set up your profile to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={createProfile.isPending}
                autoFocus
                className="border-warm-200"
              />
            </div>
            <div className="space-y-3">
              <Label>Your Role</Label>
              <RadioGroup
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as 'parent' | 'child')}
                disabled={createProfile.isPending}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 border border-warm-200 rounded-lg p-3 hover:bg-warm-50 dark:hover:bg-warm-900 transition-colors">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent" className="font-normal cursor-pointer flex-1">
                    <div className="font-medium">Parent</div>
                    <div className="text-xs text-muted-foreground">Manage family and approve permissions</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border border-warm-200 rounded-lg p-3 hover:bg-warm-50 dark:hover:bg-warm-900 transition-colors">
                  <RadioGroupItem value="child" id="child" />
                  <Label htmlFor="child" className="font-normal cursor-pointer flex-1">
                    <div className="font-medium">Child</div>
                    <div className="text-xs text-muted-foreground">Request permissions and stay connected</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button 
              type="submit" 
              disabled={createProfile.isPending} 
              className="w-full bg-warm-500 hover:bg-warm-600"
              size="lg"
            >
              {createProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
