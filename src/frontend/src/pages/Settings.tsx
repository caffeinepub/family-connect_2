import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { 
  useGetCallerUserProfile, 
  useRemoveParent, 
  useRemoveChild,
  useCreateFamilyInvitation,
  useGetActiveFamilyInvitations,
  useUpdateUserProfile
} from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Copy, Trash2, Loader2, Check, UserPlus, Link as LinkIcon, ArrowDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Role } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

export default function Settings() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const removeParent = useRemoveParent();
  const removeChild = useRemoveChild();
  const createInvitation = useCreateFamilyInvitation();
  const { data: activeInvitations } = useGetActiveFamilyInvitations();
  const updateProfile = useUpdateUserProfile();

  const [invitationHours, setInvitationHours] = useState('24');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const parents = userProfile?.parents || [];
  const children = userProfile?.children || [];
  const canAddParent = parents.length < 2;
  const isParent = userProfile?.role === Role.parent;

  const handleRemoveParent = async (principal: any) => {
    try {
      await removeParent.mutateAsync(principal);
      toast.success('Parent removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove parent');
    }
  };

  const handleRemoveChild = async (principal: any) => {
    try {
      await removeChild.mutateAsync(principal);
      toast.success('Child removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove child');
    }
  };

  const handleGenerateInvitation = async (roleType: 'parent' | 'child') => {
    try {
      const hours = parseInt(invitationHours);
      const token = await createInvitation.mutateAsync({ 
        validationTimeHours: BigInt(hours),
        roleType 
      });
      
      const inviteUrl = `${window.location.origin}?invite=${token}`;
      setGeneratedInviteLink(inviteUrl);
      toast.success(`${roleType === 'parent' ? 'Parent' : 'Child'} invitation link generated!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate invitation');
    }
  };

  const handleCopyInviteLink = async () => {
    if (!generatedInviteLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedInviteLink);
      setCopiedInvite(true);
      toast.success('Invitation link copied to clipboard!');
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invitation link');
    }
  };

  const handleChangeRoleToChild = async () => {
    if (!userProfile) return;

    try {
      const updatedProfile = {
        ...userProfile,
        role: Role.child,
      };
      
      await updateProfile.mutateAsync(updatedProfile);
      toast.success('Your role has been changed to Child');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change role');
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your family connections and invite new members</p>
      </div>

      {/* Role Change Section - Only for Parents */}
      {isParent && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-amber-600" />
              Change Your Role
            </CardTitle>
            <CardDescription>
              Switch from Parent to Child role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Important: This action cannot be reversed
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Changing your role from Parent to Child will remove your parent privileges. You will no longer be able to:
                  </p>
                  <ul className="text-sm text-amber-800 dark:text-amber-200 list-disc list-inside space-y-1 ml-2">
                    <li>Invite or manage children</li>
                    <li>Add expenses</li>
                    <li>Approve permission requests</li>
                    <li>Access parent-only features</li>
                    <li>Change back to Parent role</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Role...
                    </>
                  ) : (
                    <>
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Change to Child Role
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This will permanently change your role from <strong>Parent</strong> to <strong>Child</strong>.
                    </p>
                    <p className="text-destructive font-medium">
                      This action cannot be undone. You will not be able to change back to Parent role.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleChangeRoleToChild}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Yes, Change My Role
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Invitation System */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Family Members</CardTitle>
          <CardDescription>
            Generate invitation links to add parents or children to your family
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="inviteHours">Invitation Valid For</Label>
            <Select value={invitationHours} onValueChange={setInvitationHours}>
              <SelectTrigger id="inviteHours">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="72">3 days</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {canAddParent && (
              <Button
                onClick={() => handleGenerateInvitation('parent')}
                disabled={createInvitation.isPending}
                className="flex-1"
                variant="outline"
              >
                {createInvitation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Parent
                  </>
                )}
              </Button>
            )}
            {isParent && (
              <Button
                onClick={() => handleGenerateInvitation('child')}
                disabled={createInvitation.isPending}
                className="flex-1"
                variant="outline"
              >
                {createInvitation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Child
                  </>
                )}
              </Button>
            )}
          </div>

          {generatedInviteLink && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <LinkIcon className="h-4 w-4" />
                Generated Invitation Link
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-background rounded text-xs font-mono break-all">
                  {generatedInviteLink}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyInviteLink}
                  className="shrink-0"
                >
                  {copiedInvite ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with your family member. They'll be automatically connected when they sign in.
              </p>
            </div>
          )}

          {!canAddParent && !isParent && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You've reached the maximum of 2 parents and only parents can invite children.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parents Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Parents {!canAddParent && <span className="text-sm font-normal text-muted-foreground">(Maximum 2)</span>}
          </CardTitle>
          <CardDescription>Your connected parent accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {parents.length > 0 ? (
            <div className="space-y-2">
              {parents.map((parent, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{parent.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveParent(parent.principal)}
                    disabled={removeParent.isPending}
                    className="shrink-0 ml-2"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No parents connected yet. Generate an invitation link above to invite parents.</p>
          )}
        </CardContent>
      </Card>

      {/* Children Section */}
      {isParent && (
        <Card>
          <CardHeader>
            <CardTitle>
              Children <span className="text-sm font-normal text-muted-foreground">({children.length} total)</span>
            </CardTitle>
            <CardDescription>Your connected child accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {children.length > 0 ? (
              <div className="space-y-2">
                {children.map((child, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{child.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveChild(child.principal)}
                      disabled={removeChild.isPending}
                      className="shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No children connected yet. Generate an invitation link above to invite children.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
