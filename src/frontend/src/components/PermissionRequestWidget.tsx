import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Loader2, Send } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { PermissionType } from '../backend';

export default function PermissionRequestWidget() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { actor } = useActor();
  const [activityType, setActivityType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [selectedParentPrincipal, setSelectedParentPrincipal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parents = userProfile?.parents || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityType || !reason.trim() || !selectedParentPrincipal) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!actor) {
      toast.error('Not connected to backend');
      return;
    }

    setIsSubmitting(true);
    try {
      const parentPrincipal = Principal.fromText(selectedParentPrincipal);
      
      let permissionType: PermissionType;
      if (activityType === 'goOut') permissionType = PermissionType.goOut;
      else if (activityType === 'playGames') permissionType = PermissionType.playGames;
      else permissionType = PermissionType.watchYouTube;

      await actor.createPermissionRequest(
        parentPrincipal,
        permissionType,
        reason.trim()
      );
      
      toast.success('Permission request sent!');
      
      // Reset form
      setActivityType('');
      setReason('');
      setSelectedParentPrincipal('');
    } catch (error: any) {
      console.error('Failed to request permission:', error);
      toast.error(error.message || 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (parents.length === 0) {
    return (
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg text-warm-900 dark:text-warm-100">
            Request Permission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need to connect with a parent first. Ask them to send you an invitation link from Settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-warm-900 dark:text-warm-100">
          Request Permission
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="activityType" className="border-warm-200">
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goOut">Go Out</SelectItem>
                <SelectItem value="playGames">Play Games</SelectItem>
                <SelectItem value="watchYouTube">Watch YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Select Parent</Label>
            <Select value={selectedParentPrincipal} onValueChange={setSelectedParentPrincipal}>
              <SelectTrigger id="parent" className="border-warm-200">
                <SelectValue placeholder="Choose a parent" />
              </SelectTrigger>
              <SelectContent>
                {parents.map((parent) => (
                  <SelectItem key={parent.principal.toString()} value={parent.principal.toString()}>
                    {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need permission..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] resize-none border-warm-200"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-warm-500 hover:bg-warm-600"
            disabled={!activityType || !reason.trim() || !selectedParentPrincipal || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
