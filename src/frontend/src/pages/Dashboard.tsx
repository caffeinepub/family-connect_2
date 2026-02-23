import { Suspense } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Info } from 'lucide-react';
import { Role } from '../backend';
import LoadingSpinner from '../components/LoadingSpinner';
import HappinessMeter from '../components/HappinessMeter';
import ProblemsSolvedWidget from '../components/ProblemsSolvedWidget';
import PermissionRequestWidget from '../components/PermissionRequestWidget';
import PermissionApprovalInterface from '../components/PermissionApprovalInterface';
import FightsSolvedWidget from '../components/FightsSolvedWidget';
import FightsCreatedWidget from '../components/FightsCreatedWidget';
import AIConflictAnalysis from '../components/AIConflictAnalysis';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseInput from '../components/ExpenseInput';
import ExpenseAnalysis from '../components/ExpenseAnalysis';
import FamilyMemberGrid from '../components/FamilyMemberGrid';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-warm-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please log in to access your family dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (profileLoading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-warm-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Setting up your profile...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isParent = userProfile.role === Role.parent;
  const isChild = userProfile.role === Role.child;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100">
          Welcome back, {userProfile.displayName}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {isParent ? 'Manage your family and track activities' : 'Stay connected with your family'}
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <FamilyMemberGrid />
      </Suspense>

      {isParent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={<LoadingSpinner />}>
            <HappinessMeter />
            <ProblemsSolvedWidget />
            <FightsSolvedWidget />
            <FightsCreatedWidget />
          </Suspense>
          <div className="md:col-span-2 lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <PermissionApprovalInterface />
            </Suspense>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <AIConflictAnalysis />
            </Suspense>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <ExpenseChart />
            </Suspense>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <ExpenseInput />
            </Suspense>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <Suspense fallback={<LoadingSpinner />}>
              <ExpenseAnalysis />
            </Suspense>
          </div>
        </div>
      )}

      {isChild && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense fallback={<LoadingSpinner />}>
            <HappinessMeter />
            <ProblemsSolvedWidget />
          </Suspense>
          <div className="md:col-span-2">
            <Suspense fallback={<LoadingSpinner />}>
              <PermissionRequestWidget />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
