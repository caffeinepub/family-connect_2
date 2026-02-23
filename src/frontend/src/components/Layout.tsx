import { ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Home, Image, Bell, MapPin, MessageCircle, Heart, GraduationCap, Settings } from 'lucide-react';
import ShareApp from './ShareApp';
import ChatWidget from './ChatWidget';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useOnboarding } from '../hooks/useOnboarding';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Role } from '../backend';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { shouldShowGuidance, markStepComplete } = useOnboarding();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';
  
  const isParent = userProfile?.role === Role.parent;
  const showShareHighlight = isAuthenticated && isParent && shouldShowGuidance('shareButtonHighlight');

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleShareClick = () => {
    if (showShareHighlight) {
      markStepComplete('shareButtonHighlight');
    }
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/media', icon: Image, label: 'Media' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/locations', icon: MapPin, label: 'Locations' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/education', icon: GraduationCap, label: 'Education' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-white to-warm-100 dark:from-warm-950 dark:via-warm-900 dark:to-warm-950">
      <header className="bg-white dark:bg-warm-900 border-b border-warm-200 dark:border-warm-800 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-warm-500 to-warm-600 p-2 rounded-xl shadow-md">
                <Heart className="h-6 w-6 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-warm-900 dark:text-warm-100">FamilyConnect</h1>
                <p className="text-xs text-warm-600 dark:text-warm-400">Stay Connected with Your Loved Ones</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <TooltipProvider>
                  <Tooltip open={showShareHighlight}>
                    <TooltipTrigger asChild>
                      <div onClick={handleShareClick}>
                        <ShareApp highlighted={showShareHighlight} />
                      </div>
                    </TooltipTrigger>
                    {showShareHighlight && (
                      <TooltipContent side="bottom" className="bg-warm-600 text-white">
                        <p className="font-medium">👋 Invite your family members!</p>
                        <p className="text-xs">Click here to share your invitation link</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant={isAuthenticated ? 'outline' : 'default'}
                className={isAuthenticated ? 'border-warm-300' : 'bg-warm-500 hover:bg-warm-600'}
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white dark:bg-warm-900 border-b border-warm-200 dark:border-warm-800 shadow-sm sticky top-[73px] z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex items-center gap-2 whitespace-nowrap ${
                      isActive ? 'bg-warm-500 hover:bg-warm-600 text-white' : 'text-warm-700 dark:text-warm-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="bg-white dark:bg-warm-900 border-t border-warm-200 dark:border-warm-800 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-warm-600 dark:text-warm-400">
              © {new Date().getFullYear()} FamilyConnect. All rights reserved.
            </p>
            <p className="text-sm text-warm-600 dark:text-warm-400 flex items-center gap-1">
              Built with <Heart className="h-3 w-3 text-warm-500 fill-warm-500" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'familyconnect'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-warm-500 hover:text-warm-600 font-medium underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {isAuthenticated && <ChatWidget />}
    </div>
  );
}
