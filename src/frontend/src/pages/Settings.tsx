import { useState } from 'react';
import { useGetCallerUserProfile, useCreateFamilyInvitation, useGetActiveFamilyInvitations, useRemoveParent, useRemoveChild, useUpdateUserProfile, useGetAIRemedyEnabled, useSetAIRemedyEnabled } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Switch } from '../components/ui/switch';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Loader2, Copy, Check, Users, Trash2, AlertTriangle, Link as LinkIcon, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { Role } from '../backend';

export default function Settings() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: invitations, isLoading: invitationsLoading } = useGetActiveFamilyInvitations();
  const { data: aiRemedyEnabled, isLoading: aiToggleLoading } = useGetAIRemedyEnabled();
  const createInvitation = useCreateFamilyInvitation();
  const removeParent = useRemoveParent();
  const removeChild = useRemoveChild();
  const updateProfile = useUpdateUserProfile();
  const setAIRemedy = useSetAIRemedyEnabled();

  const [childPrincipalInput, setChildPrincipalInput] = useState('');
  const [invitationHours, setInvitationHours] = useState('48');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRoleChangeDialog, setShowRoleChangeDialog] = useState(false);

  const isAuthenticated = !!identity;
  const isParent = userProfile?.role === Role.parent;
  const isChild = userProfile?.role === Role.child;

  const handleToggleAIRemedy = async (checked: boolean) => {
    try {
      await setAIRemedy.mutateAsync(checked);
      toast.success(checked ? 'AI remedies enabled' : 'AI remedies disabled');
    } catch (error) {
      toast.error('Failed to update AI remedy setting');
    }
  };

  const handleGenerateInvitation = async () => {
    if (!childPrincipalInput.trim()) {
      toast.error('Please enter a child principal ID');
      return;
    }

    try {
      const childPrincipal = Principal.fromText(childPrincipalInput.trim());
      const hours = BigInt(parseInt(invitationHours, 10) || 48);

      const token = await createInvitation.mutateAsync({
        childPrincipal,
        validationTimeHours: hours,
      });

      const inviteUrl = `${window.location.origin}/?invite=${token}`;
      setGeneratedLink(inviteUrl);
      toast.success('Invitation link generated!');
    } catch (error: any) {
      console.error('Failed to generate invitation:', error);
      toast.error(error.message || 'Failed to generate invitation link');
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRemoveParent = async (parentPrincipal: Principal) => {
    try {
      await removeParent.mutateAsync(parentPrincipal);
    } catch (error: any) {
      console.error('Failed to remove parent:', error);
    }
  };

  const handleRemoveChild = async (childPrincipal: Principal) => {
    try {
      await removeChild.mutateAsync(childPrincipal);
    } catch (error: any) {
      console.error('Failed to remove child:', error);
    }
  };

  const handleRoleChange = async () => {
    if (!userProfile) return;

    try {
      const updatedProfile = {
        ...userProfile,
        role: Role.child,
      };
      
      await updateProfile.mutateAsync(updatedProfile);
      toast.success('Role changed to child successfully!');
      setShowRoleChangeDialog(false);
    } catch (error: any) {
      console.error('Failed to change role:', error);
      toast.error(error.message || 'Failed to change role');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please log in to access settings.
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your family connections and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card className="border-warm-200">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Display Name</Label>
            <p className="text-lg font-medium text-warm-900 dark:text-warm-100 mt-1">
              {userProfile?.displayName}
            </p>
          </div>
          <div>
            <Label>Role</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isParent ? 'default' : 'secondary'}>
                {isParent ? 'Parent' : 'Child'}
              </Badge>
              {isParent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleChangeDialog(true)}
                  className="text-xs"
                >
                  Change to Child
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Remedy Settings */}
      <Card className="border-warm-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-warm-500" />
            AI Remedy Settings
          </CardTitle>
          <CardDescription>Configure AI-powered conflict analysis and remedies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-warm-50 dark:bg-warm-900 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="ai-remedy-setting" className="cursor-pointer font-medium">
                Enable AI Remedies
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive parliamentary-style guidance and remedies for family conflicts
              </p>
            </div>
            <Switch
              id="ai-remedy-setting"
              checked={aiRemedyEnabled || false}
              onCheckedChange={handleToggleAIRemedy}
              disabled={aiToggleLoading || setAIRemedy.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card className="border-warm-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Members
          </CardTitle>
          <CardDescription>Your connected family members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Parents */}
          {userProfile?.parents && userProfile.parents.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-warm-900 dark:text-warm-100">Parents</h3>
              <div className="space-y-2">
                {userProfile.parents.map((parent) => (
                  <div
                    key={parent.principal.toString()}
                    className="flex items-center justify-between p-3 border border-warm-200 rounded-lg bg-warm-50 dark:bg-warm-900"
                  >
                    <div>
                      <p className="font-medium text-warm-900 dark:text-warm-100">{parent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {parent.principal.toString().slice(0, 20)}...
                      </p>
                    </div>
                    {isChild && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveParent(parent.principal)}
                        disabled={removeParent.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Children */}
          {userProfile?.children && userProfile.children.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-warm-900 dark:text-warm-100">Children</h3>
              <div className="space-y-2">
                {userProfile.children.map((child) => (
                  <div
                    key={child.principal.toString()}
                    className="flex items-center justify-between p-3 border border-warm-200 rounded-lg bg-warm-50 dark:bg-warm-900"
                  >
                    <div>
                      <p className="font-medium text-warm-900 dark:text-warm-100">{child.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {child.principal.toString().slice(0, 20)}...
                      </p>
                    </div>
                    {isParent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChild(child.principal)}
                        disabled={removeChild.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
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

      {/* Invitation System (Parents Only) */}
      {isParent && (
        <Card className="border-warm-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Invite Family Members
            </CardTitle>
            <CardDescription>Generate invitation links for children</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="childPrincipal">Child's Principal ID</Label>
              <Input
                id="childPrincipal"
                placeholder="Enter child's principal ID"
                value={childPrincipalInput}
                onChange={(e) => setChildPrincipalInput(e.target.value)}
                className="border-warm-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Valid for (hours)</Label>
              <Input
                id="hours"
                type="number"
                value={invitationHours}
                onChange={(e) => setInvitationHours(e.target.value)}
                className="border-warm-200"
              />
            </div>
            <Button
              onClick={handleGenerateInvitation}
              disabled={createInvitation.isPending}
              className="w-full bg-warm-500 hover:bg-warm-600"
            >
              {createInvitation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Invitation Link'
              )}
            </Button>

            {generatedLink && (
              <div className="p-4 border border-warm-200 rounded-lg bg-warm-50 dark:bg-warm-900 space-y-2">
                <Label>Generated Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="text-xs border-warm-200"
                  />
                  <Button onClick={handleCopyLink} size="sm">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Active Invitations */}
            {invitations && invitations.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-warm-900 dark:text-warm-100">Active Invitations</h3>
                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div
                      key={inv.token}
                      className="p-3 border border-warm-200 rounded-lg bg-warm-50 dark:bg-warm-900"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <p className="font-medium">Token: {inv.token.slice(0, 20)}...</p>
                          <p className="text-muted-foreground">
                            Expires: {new Date(Number(inv.expires) / 1000000).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={inv.isValid ? 'default' : 'secondary'}>
                          {inv.isValid ? 'Active' : 'Used'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role Change Dialog */}
      <AlertDialog open={showRoleChangeDialog} onOpenChange={setShowRoleChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Change Role to Child?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will change your role from Parent to Child. You will lose access to parent-only features.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange} className="bg-warm-500 hover:bg-warm-600">
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
