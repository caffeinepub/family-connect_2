import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useOnboarding } from '../hooks/useOnboarding';
import { useEffect } from 'react';
import HappinessMeter from '../components/HappinessMeter';
import ProblemsSolvedWidget from '../components/ProblemsSolvedWidget';
import PermissionRequestWidget from '../components/PermissionRequestWidget';
import PermissionApprovalInterface from '../components/PermissionApprovalInterface';
import FightsCreatedWidget from '../components/FightsCreatedWidget';
import FightsSolvedWidget from '../components/FightsSolvedWidget';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseInput from '../components/ExpenseInput';
import ExpenseAnalysis from '../components/ExpenseAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Heart, TrendingUp, Users, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Role } from '../backend';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { markStepComplete, shouldShowGuidance } = useOnboarding();

  const isAuthenticated = !!identity;
  const isParent = userProfile?.role === Role.parent;
  const isChild = userProfile?.role === Role.child;
  
  const hasFamily = (userProfile?.parents.length ?? 0) > 0 || (userProfile?.children.length ?? 0) > 0;
  const showParentGuidance = isParent && !hasFamily && shouldShowGuidance('shareButtonHighlight');
  const showChildGuidance = isChild && !hasFamily && shouldShowGuidance('firstFamilyConnection');

  // Mark first dashboard visit as complete
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      markStepComplete('firstDashboardVisit');
    }
  }, [isAuthenticated, userProfile, markStepComplete]);

  // Auto-highlight share button for parents without family
  useEffect(() => {
    if (showParentGuidance) {
      // The highlight is handled in Layout.tsx
      const timer = setTimeout(() => {
        markStepComplete('shareButtonHighlight');
      }, 10000); // Auto-dismiss after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [showParentGuidance, markStepComplete]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please log in to view your family dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-warm-500" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Setting up your profile...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-warm-900 dark:text-warm-100">
          Welcome back, {userProfile.displayName}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Your family dashboard
        </p>
      </div>

      {/* Onboarding Guidance for Parents */}
      {showParentGuidance && (
        <Alert className="bg-warm-50 dark:bg-warm-900/30 border-warm-300 dark:border-warm-700">
          <UserPlus className="h-5 w-5 text-warm-600" />
          <AlertDescription className="text-warm-900 dark:text-warm-100">
            <strong>👋 Welcome, Parent!</strong> Click the <strong>"Invite Family"</strong> button in the header to share FamilyConnect with your children.
          </AlertDescription>
        </Alert>
      )}

      {/* Onboarding Guidance for Children */}
      {showChildGuidance && (
        <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700">
          <Users className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <strong>👋 Welcome!</strong> Ask your parent to share their invitation link with you, or connect with them in <strong>Settings</strong> to join your family.
          </AlertDescription>
        </Alert>
      )}

      {/* Top Metrics Row - Visible to All */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HappinessMeter />
        <ProblemsSolvedWidget />
      </div>

      {/* Expense Tracking Section - Visible to All */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-warm-600" />
          <h2 className="text-2xl font-semibold text-warm-900 dark:text-warm-100">
            Family Expenses
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseChart />
          {isParent && <ExpenseInput />}
        </div>

        <ExpenseAnalysis />
      </div>

      {/* Role-Based Widgets */}
      {isChild && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-warm-900 dark:text-warm-100">
            Child Dashboard
          </h2>
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Permission request and approval features are coming soon! 
              The backend implementation is in progress.
            </AlertDescription>
          </Alert>
          <PermissionRequestWidget />
        </div>
      )}

      {isParent && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-warm-900 dark:text-warm-100">
            Parent Dashboard
          </h2>
          
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Permission approval and fight tracking features are coming soon! 
              The backend implementation is in progress.
            </AlertDescription>
          </Alert>

          {/* Permission Approval */}
          <PermissionApprovalInterface />

          {/* Fight Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FightsSolvedWidget />
            <FightsCreatedWidget />
          </div>
        </div>
      )}

      {/* Family Updates Feed */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-warm-600" />
          <h2 className="text-2xl font-semibold text-warm-900 dark:text-warm-100">
            Family Updates
          </h2>
        </div>
        <Card className="border-warm-200">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent updates. Start sharing with your family!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
