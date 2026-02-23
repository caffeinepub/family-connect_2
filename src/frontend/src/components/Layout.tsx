import { ReactNode } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Home, Image, Bell, MapPin, MessageCircle, Heart, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

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

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/media', label: 'Photos', icon: Image },
    { path: '/reminders', label: 'Reminders', icon: Bell },
    { path: '/locations', label: 'Locations', icon: MapPin },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/education', label: 'Education', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-warm-50 via-background to-warm-100">
      <header className="sticky top-0 z-50 w-full border-b border-warm-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/generated/app-logo.dim_200x200.png" 
              alt="FamilyHub Logo" 
              className="h-10 w-10 object-contain"
            />
            <h1 className="text-xl font-bold text-warm-900 dark:text-warm-100">FamilyHub</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
          >
            {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {isAuthenticated ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <img 
              src="/assets/generated/app-logo.dim_200x200.png" 
              alt="FamilyHub Logo" 
              className="h-24 w-24 object-contain"
            />
            <h2 className="text-3xl font-bold text-warm-900 dark:text-warm-100">Welcome to FamilyHub</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Stay connected with your loved ones. Share updates, photos, locations, and messages all in one place.
            </p>
            <Button onClick={handleAuth} size="lg" className="mt-4">
              Get Started
            </Button>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-warm-200 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-col h-auto py-2 px-3 gap-1"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="border-t border-warm-200 bg-warm-50 dark:bg-warm-950 py-6 mb-16 md:mb-0">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} FamilyHub. Built with{' '}
            <Heart className="inline h-3 w-3 text-warm-500 fill-warm-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-warm-600 hover:text-warm-700 dark:text-warm-400 dark:hover:text-warm-300 underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
