import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateProfile, useValidateFamilyInvitation } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Loader2 } from 'lucide-react';
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

function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const createProfile = useCreateProfile();
  const validateInvitation = useValidateFamilyInvitation();

  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'parent' | 'child'>('parent');
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);

  const isAuthenticated = !!identity;

  // Check for invitation token in URL
  useEffect(() => {
    const checkInvitationToken = async () => {
      if (!isAuthenticated || !identity) return;

      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite');

      if (inviteToken && !isProcessingInvite) {
        setIsProcessingInvite(true);
        console.log('🎟️ Found invitation token in URL:', inviteToken);

        try {
          const childPrincipal = identity.getPrincipal();
          const parentPrincipal = await validateInvitation.mutateAsync({
            token: inviteToken,
            childPrincipal,
          });

          toast.success('Successfully connected to family!');
          console.log('✅ Connected to parent:', parentPrincipal.toString());

          // Clear the invite parameter from URL
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
  }, [isAuthenticated, identity, validateInvitation, isProcessingInvite]);

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  console.log('🔍 [ProfileSetupModal] Render state:', {
    isAuthenticated,
    profileLoading,
    isFetched,
    userProfile,
    showProfileSetup,
    userProfileIsNull: userProfile === null,
    userProfileIsUndefined: userProfile === undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      console.log('📝 [ProfileSetupModal] Submitting profile setup with role:', selectedRole);
      const roleEnum: Role = selectedRole === 'parent' ? Role.parent : Role.child;
      console.log('📝 [ProfileSetupModal] Role enum created:', roleEnum);
      
      await createProfile.mutateAsync({
        displayName: displayName.trim(),
        role: roleEnum,
      });
      
      console.log('✅ [ProfileSetupModal] Profile created successfully');
      toast.success('Profile created successfully!');
    } catch (error: any) {
      console.error('❌ [ProfileSetupModal] Profile creation failed:', error);
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to FamilyConnect!</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Your Name</Label>
            <Input
              id="displayName"
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={createProfile.isPending}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Your Role</Label>
            <RadioGroup
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as 'parent' | 'child')}
              disabled={createProfile.isPending}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parent" id="parent" />
                <Label htmlFor="parent" className="font-normal cursor-pointer">
                  Parent
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="child" id="child" />
                <Label htmlFor="child" className="font-normal cursor-pointer">
                  Child
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" disabled={createProfile.isPending} className="w-full">
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
