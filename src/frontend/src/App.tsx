import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MediaGallery from './pages/MediaGallery';
import Reminders from './pages/Reminders';
import LocationSharing from './pages/LocationSharing';
import Chat from './pages/Chat';
import EducationalHub from './pages/EducationalHub';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';

function AppContent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const needsOnboarding = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (needsOnboarding) {
      navigate({ to: '/onboarding' });
    }
  }, [needsOnboarding, navigate]);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: AppContent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: Onboarding,
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
  onboardingRoute,
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
