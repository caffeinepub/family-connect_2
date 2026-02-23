import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { useGetCallerUserProfile, useUpdateUserProfile, useCreateFamilyInvitation, useGetActiveFamilyInvitations, useDeleteAccount } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { Loader2, Copy, Check, UserCircle, Users, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '../backend';

export default function Settings() {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const updateProfile = useUpdateUserProfile();
  const createInvitation = useCreateFamilyInvitation();
  const { data: activeInvitations } = useGetActiveFamilyInvitations();
  const deleteAccount = useDeleteAccount();

  const [displayName, setDisplayName] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

  const isAuthenticated = !!identity;
  const isParent = userProfile?.role === Role.parent;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !displayName.trim()) return;

    try {
      await updateProfile.mutateAsync({
        ...userProfile,
        displayName: displayName.trim(),
      });
      toast.success('Profile updated successfully');
      setDisplayName('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleGenerateInvite = async () => {
    if (!identity) return;

    setIsGeneratingInvite(true);
    try {
      const childPrincipal = identity.getPrincipal();
      const token = await createInvitation.mutateAsync({
        child: childPrincipal,
        validationTimeHours: BigInt(72),
      });

      const inviteUrl = `${window.location.origin}#invite=${token}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedToken(token);
      toast.success('Invitation link copied to clipboard!');

      setTimeout(() => setCopiedToken(null), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invitation');
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyInvite = async (token: string) => {
    const inviteUrl = `${window.location.origin}#invite=${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    toast.success('Invitation link copied!');
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      await clear();
    } catch (error: any) {
      console.error('Delete account error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-warm-200">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Please log in to access settings</p>
          </CardContent>
        </Card>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and family connections</p>
      </div>

      {/* Profile Information */}
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-warm-500" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Name</Label>
            <p className="text-sm font-medium">{userProfile?.displayName}</p>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <p className="text-sm font-medium capitalize">{userProfile?.role || 'Not set'}</p>
          </div>
          <Separator />
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Update Display Name</Label>
              <Input
                id="displayName"
                placeholder="Enter new name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border-warm-200"
              />
            </div>
            <Button
              type="submit"
              disabled={updateProfile.isPending || !displayName.trim()}
              className="bg-warm-500 hover:bg-warm-600"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-warm-500" />
            Family Members
          </CardTitle>
          <CardDescription>Your connected family members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile?.parents && userProfile.parents.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Parents</Label>
              <div className="space-y-2">
                {userProfile.parents.map((parent) => (
                  <div key={parent.principal.toString()} className="flex items-center justify-between p-3 bg-warm-50 dark:bg-warm-900 rounded-lg">
                    <span className="text-sm font-medium">{parent.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {userProfile?.children && userProfile.children.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Children</Label>
              <div className="space-y-2">
                {userProfile.children.map((child) => (
                  <div key={child.principal.toString()} className="flex items-center justify-between p-3 bg-warm-50 dark:bg-warm-900 rounded-lg">
                    <span className="text-sm font-medium">{child.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!userProfile?.parents || userProfile.parents.length === 0) &&
            (!userProfile?.children || userProfile.children.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No family members connected yet
              </p>
            )}
        </CardContent>
      </Card>

      {/* Invitation Management - Parent Only */}
      {isParent && (
        <Card className="border-warm-200 shadow-md">
          <CardHeader>
            <CardTitle>Family Invitations</CardTitle>
            <CardDescription>Generate invitation links for your children</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateInvite}
              disabled={isGeneratingInvite}
              className="w-full bg-warm-500 hover:bg-warm-600"
            >
              {isGeneratingInvite ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate New Invitation Link'
              )}
            </Button>

            {activeInvitations && activeInvitations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Active Invitations</Label>
                <div className="space-y-2">
                  {activeInvitations.map((invitation) => (
                    <div key={invitation.token} className="flex items-center justify-between p-3 bg-warm-50 dark:bg-warm-900 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          Expires: {new Date(Number(invitation.expires) / 1000000).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyInvite(invitation.token)}
                      >
                        {copiedToken === invitation.token ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-red-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                  <p className="font-semibold text-red-600">All your messages, expenses, and family connections will be lost.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                  {deleteAccount.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
