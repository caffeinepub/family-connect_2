import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateProfile } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MediaGallery from './pages/MediaGallery';
import Reminders from './pages/Reminders';
import LocationSharing from './pages/LocationSharing';
import Chat from './pages/Chat';
import EducationalHub from './pages/EducationalHub';
import { Role } from './backend';

function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const createProfile = useCreateProfile();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<'role' | 'name'>('role');

  const isAuthenticated = !!identity;
  
  // Show modal if: authenticated AND profile loaded AND (no profile OR profile exists but no role)
  // Check for both undefined and null role values
  const hasNoRole = userProfile === null || userProfile?.role === undefined || userProfile?.role === null;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && hasNoRole;

  // Component lifecycle logging
  useEffect(() => {
    console.log('🎬 [ProfileSetupModal] Component mounted');
    return () => {
      console.log('🎬 [ProfileSetupModal] Component unmounted');
    };
  }, []);

  // Modal open state logging
  useEffect(() => {
    console.log('🚪 [ProfileSetupModal] Modal open state changed:', showProfileSetup);
  }, [showProfileSetup]);

  // Comprehensive debug logging for profile setup modal
  useEffect(() => {
    console.log('🔍 [ProfileSetupModal] Full State Debug:', {
      isAuthenticated,
      profileLoading,
      isFetched,
      userProfile: userProfile ? {
        displayName: userProfile.displayName,
        role: userProfile.role,
        roleType: typeof userProfile.role,
        roleIsNull: userProfile.role === null,
        roleIsUndefined: userProfile.role === undefined,
        lastUpdate: userProfile.lastUpdate,
      } : null,
      hasNoRole,
      showProfileSetup,
      currentStep: step,
      selectedRole: role,
      identity: identity ? identity.getPrincipal().toString() : null,
    });
  }, [isAuthenticated, profileLoading, isFetched, userProfile, showProfileSetup, step, role, identity, hasNoRole]);

  // Log when userProfile updates
  useEffect(() => {
    if (userProfile !== undefined) {
      console.log('📦 [ProfileSetupModal] UserProfile updated:', {
        profile: userProfile,
        roleField: userProfile?.role,
        roleIsNull: userProfile?.role === null,
        roleIsUndefined: userProfile?.role === undefined,
        hasRole: !!(userProfile?.role),
      });
    }
  }, [userProfile]);

  const handleRoleSelection = () => {
    console.log('🎯 [ProfileSetupModal] Role selection button clicked, selected role:', role);
    if (role) {
      console.log('✅ [ProfileSetupModal] Moving to name step');
      setStep('name');
    } else {
      console.log('⚠️ [ProfileSetupModal] No role selected, cannot proceed');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !role) {
      console.log('⚠️ [ProfileSetupModal] Cannot save - missing data:', {
        displayName: displayName.trim(),
        role,
      });
      return;
    }

    console.log('💾 [ProfileSetupModal] Saving profile:', {
      displayName: displayName.trim(),
      role,
    });

    try {
      await createProfile.mutateAsync({
        displayName: displayName.trim(),
        role,
      });
      console.log('✅ [ProfileSetupModal] Profile saved successfully');
      // Reset form state
      setDisplayName('');
      setRole(null);
      setStep('role');
    } catch (error) {
      console.error('❌ [ProfileSetupModal] Failed to save profile:', error);
    }
  };

  // Log when role radio buttons are clicked
  const handleRoleChange = (value: string) => {
    console.log('📝 [ProfileSetupModal] Role radio button clicked:', value);
    setRole(value as Role);
  };

  return (
    <Dialog open={showProfileSetup}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to FamilyHub!</DialogTitle>
          <DialogDescription>
            {step === 'role' 
              ? "First, let us know your role in the family."
              : "What name would you like your family to see?"}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'role' ? (
          <div className="space-y-4">
            <RadioGroup value={role || ''} onValueChange={handleRoleChange}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value={Role.parent} id="parent" />
                <Label htmlFor="parent" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Parent</div>
                  <div className="text-sm text-muted-foreground">
                    Manage permissions, view family insights, and track conflicts
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value={Role.child} id="child" />
                <Label htmlFor="child" className="flex-1 cursor-pointer">
                  <div className="font-semibold">Child</div>
                  <div className="text-sm text-muted-foreground">
                    Request permissions and access educational features
                  </div>
                </Label>
              </div>
            </RadioGroup>
            <Button 
              onClick={handleRoleSelection} 
              className="w-full" 
              disabled={!role}
            >
              Continue
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              placeholder="Enter your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={!displayName.trim() || createProfile.isPending}>
              {createProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <ProfileSetupModal />
      <Layout>
        <Outlet />
      </Layout>
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  mediaRoute,
  remindersRoute,
  locationsRoute,
  chatRoute,
  educationRoute,
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
