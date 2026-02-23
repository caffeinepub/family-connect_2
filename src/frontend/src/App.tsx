import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateProfile, useValidateFamilyInvitation } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { Loader2, UserCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MediaGallery from './pages/MediaGallery';
import Reminders from './pages/Reminders';
import LocationSharing from './pages/LocationSharing';
import Chat from './pages/Chat';
import EducationalHub from './pages/EducationalHub';
import Settings from './pages/Settings';
import { Role } from './backend';
import { getInvitationTokenFromURL, clearInvitationTokenFromURL } from './utils/urlParams';
import { useOnboarding } from './hooks/useOnboarding';

function ProfileSetupModal() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const createProfile = useCreateProfile();
  const validateInvitation = useValidateFamilyInvitation();
  const { markStepComplete, shouldShowGuidance } = useOnboarding();

  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child'>('parent');
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);

  const isAuthenticated = !!identity;

  // Auto-detect and process invitation token from URL
  useEffect(() => {
    const processInvitationToken = async () => {
      if (!isAuthenticated || !identity || isProcessingInvite) return;

      const inviteToken = getInvitationTokenFromURL();

      if (inviteToken) {
        setIsProcessingInvite(true);
        console.log('🎟️ Auto-processing invitation token:', inviteToken);

        try {
          const childPrincipal = identity.getPrincipal();
          const parentPrincipal = await validateInvitation.mutateAsync({
            token: inviteToken,
            child: childPrincipal,
          });

          toast.success('🎉 Successfully connected to your family!');
          console.log('✅ Connected to parent:', parentPrincipal.toString());
          
          markStepComplete('firstFamilyConnection');
          clearInvitationTokenFromURL();
        } catch (error: any) {
          console.error('❌ Failed to validate invitation:', error);
          toast.error(error.message || 'Failed to join family. Please try again.');
          clearInvitationTokenFromURL();
        } finally {
          setIsProcessingInvite(false);
        }
      }
    };

    processInvitationToken();
  }, [isAuthenticated, identity, validateInvitation, isProcessingInvite, markStepComplete]);

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      console.log('📝 Creating profile with role:', selectedRole);
      const roleEnum: Role = selectedRole === 'parent' ? Role.parent : Role.child;
      
      await createProfile.mutateAsync({
        displayName: displayName.trim(),
        role: roleEnum,
      });
      
      console.log('✅ Profile created successfully');
      toast.success('Welcome to FamilyConnect! 🎉');
      markStepComplete('roleSelection');
      
      // Navigate to dashboard after successful profile creation
      setTimeout(() => {
        navigate({ to: '/' });
      }, 100);
    } catch (error: any) {
      console.error('❌ Profile creation failed:', error);
      toast.error(error.message || 'Failed to create profile');
    }
  };

  const showRoleGuidance = shouldShowGuidance('roleSelection');

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to FamilyConnect! 👋</DialogTitle>
          <DialogDescription className="text-base">
            Let's get you started in just two quick steps.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-base font-medium">What's your name?</Label>
            <Input
              id="displayName"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={createProfile.isPending}
              autoFocus
              className="text-base py-5"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-medium">Choose your role</Label>
            {showRoleGuidance && (
              <p className="text-sm text-muted-foreground">
                Select whether you're a parent managing the family or a child joining your family.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('parent')}
                disabled={createProfile.isPending}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                  selectedRole === 'parent'
                    ? 'border-warm-500 bg-warm-50 dark:bg-warm-900/30'
                    : 'border-warm-200 hover:border-warm-300 dark:border-warm-700'
                } ${createProfile.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Users className={`h-10 w-10 ${selectedRole === 'parent' ? 'text-warm-600' : 'text-warm-400'}`} />
                <div className="text-center">
                  <div className="font-semibold text-base">Parent</div>
                  <div className="text-xs text-muted-foreground mt-1">Manage family</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedRole('child')}
                disabled={createProfile.isPending}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                  selectedRole === 'child'
                    ? 'border-warm-500 bg-warm-50 dark:bg-warm-900/30'
                    : 'border-warm-200 hover:border-warm-300 dark:border-warm-700'
                } ${createProfile.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <UserCircle className={`h-10 w-10 ${selectedRole === 'child' ? 'text-warm-600' : 'text-warm-400'}`} />
                <div className="text-center">
                  <div className="font-semibold text-base">Child</div>
                  <div className="text-xs text-muted-foreground mt-1">Join family</div>
                </div>
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={createProfile.isPending} 
            className="w-full py-6 text-base bg-warm-500 hover:bg-warm-600"
            size="lg"
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Your Profile...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <ProfileSetupModal />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const mediaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/media',
  component: MediaGallery,
});

const remindersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reminders',
  component: Reminders,
});

const locationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/locations',
  component: LocationSharing,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: Chat,
});

const educationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/education',
  component: EducationalHub,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  mediaRoute,
  remindersRoute,
  locationsRoute,
  chatRoute,
  educationRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
