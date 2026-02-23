import { useState, useEffect } from 'react';
import { useGetUpdates, useCreateUpdate, useGetCallerUserProfile, useGetAllProfiles } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import HappinessMeter from '../components/HappinessMeter';
import ProblemsSolvedWidget from '../components/ProblemsSolvedWidget';
import PermissionRequestWidget from '../components/PermissionRequestWidget';
import PermissionApprovalInterface from '../components/PermissionApprovalInterface';
import FightsSolvedWidget from '../components/FightsSolvedWidget';
import FightsCreatedWidget from '../components/FightsCreatedWidget';
import ExpenseChart from '../components/ExpenseChart';
import ExpenseInput from '../components/ExpenseInput';
import ExpenseAnalysis from '../components/ExpenseAnalysis';
import { Role } from '../backend';

export default function Dashboard() {
  const [updateText, setUpdateText] = useState('');
  const { data: updates, isLoading: updatesLoading } = useGetUpdates();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: allProfiles } = useGetAllProfiles();
  const createUpdate = useCreateUpdate();

  const isParent = userProfile?.role === Role.parent;
  const isChild = userProfile?.role === Role.child;

  // Debug logging for role-based widget visibility
  useEffect(() => {
    console.log('🏠 [Dashboard] User Profile State:', {
      userProfile,
      profileLoading,
      profileFetched,
      role: userProfile?.role,
      roleType: typeof userProfile?.role,
      roleValue: userProfile?.role,
      isParent,
      isChild,
      roleComparison: {
        'role === Role.parent': userProfile?.role === Role.parent,
        'role === Role.child': userProfile?.role === Role.child,
        'Role.parent value': Role.parent,
        'Role.child value': Role.child,
        'role === undefined': userProfile?.role === undefined,
        'role === null': userProfile?.role === null,
      },
    });

    if (userProfile?.role === undefined || userProfile?.role === null) {
      console.warn('⚠️ [Dashboard] User role is undefined or null!');
    }

    console.log('🎯 [Dashboard - Widget Visibility]:', {
      'Should show PermissionRequestWidget (child)': isChild,
      'Should show PermissionApprovalInterface (parent)': isParent,
    });
  }, [userProfile, profileLoading, profileFetched, isParent, isChild]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    await createUpdate.mutateAsync(updateText);
    setUpdateText('');
  };

  const getProfileName = (principal: Principal): string => {
    const profile = allProfiles?.find(
      (p) => p.displayName && allProfiles.indexOf(p) !== -1
    );
    return profile?.displayName || 'Family Member';
  };

  const formatTimestamp = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <img
          src="/assets/generated/dashboard-interface.dim_1200x800.png"
          alt="FamilyConnect Dashboard"
          className="w-full h-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HappinessMeter />
        <ProblemsSolvedWidget />
      </div>

      {isParent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FightsSolvedWidget />
            <FightsCreatedWidget />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <PermissionApprovalInterface />
          </div>
        </>
      )}

      {isChild && (
        <div className="grid grid-cols-1 gap-4">
          <PermissionRequestWidget />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-warm-900 dark:text-warm-100">
          Weekly Expense Tracking
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExpenseChart />
          {isParent && <ExpenseInput />}
        </div>

        <ExpenseAnalysis />
      </div>

      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100">Share an Update</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="What's happening with the family?"
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              className="min-h-[100px] resize-none border-warm-200"
            />
            <Button type="submit" disabled={!updateText.trim() || createUpdate.isPending}>
              {createUpdate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Update
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100">Family Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {updatesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
            </div>
          ) : updates && updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update: any, index: number) => {
                const authorName = getProfileName(update.author);
                const initials = authorName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div key={index} className="flex gap-3 p-4 bg-warm-50 dark:bg-warm-900 rounded-lg">
                    <Avatar className="h-10 w-10 border-2 border-warm-300">
                      <AvatarFallback className="bg-warm-200 text-warm-800 font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-warm-900 dark:text-warm-100">
                          {authorName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(update.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{update.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No updates yet. Be the first to share something!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
