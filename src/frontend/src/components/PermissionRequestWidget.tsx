import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Send } from 'lucide-react';
import { useRequestPermission, type PermissionType } from '../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export default function PermissionRequestWidget() {
  const [activityType, setActivityType] = useState<PermissionType | ''>('');
  const [reason, setReason] = useState('');
  const [parentPrincipal, setParentPrincipal] = useState('');
  const requestPermission = useRequestPermission();

  // Debug logging when component mounts/unmounts
  useEffect(() => {
    console.log('🎫 [PermissionRequestWidget] Component mounted - user is child');
    return () => {
      console.log('🎫 [PermissionRequestWidget] Component unmounted');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityType || !reason.trim() || !parentPrincipal.trim()) {
      console.warn('⚠️ [PermissionRequestWidget] Form incomplete:', {
        activityType,
        reason: reason.trim(),
        parentPrincipal: parentPrincipal.trim(),
      });
      return;
    }

    try {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('📤 [PermissionRequestWidget] Submitting request:', {
        requestId,
        requestType: activityType,
        reason: reason.trim(),
        parent: parentPrincipal.trim(),
      });

      await requestPermission.mutateAsync({
        requestId,
        requestType: activityType as PermissionType,
        reason: reason.trim(),
        parent: Principal.fromText(parentPrincipal.trim()),
      });
      
      console.log('✅ [PermissionRequestWidget] Request submitted successfully');
      toast.success('Permission request sent!');
      
      // Reset form
      setActivityType('');
      setReason('');
      setParentPrincipal('');
    } catch (error) {
      console.error('❌ [PermissionRequestWidget] Failed to request permission:', error);
      toast.error('Failed to send request. Please check the parent principal ID.');
    }
  };

  const getActivityLabel = (type: PermissionType | string) => {
    switch (type) {
      case 'goOut':
        return 'Go Out';
      case 'playGames':
        return 'Play Games';
      case 'watchYouTube':
        return 'Watch YouTube';
      default:
        return type;
    }
  };

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
            <label className="text-sm font-medium">Activity Type</label>
            <Select value={activityType} onValueChange={(value) => {
              console.log('📝 [PermissionRequestWidget] Activity type changed:', value);
              setActivityType(value as PermissionType);
            }}>
              <SelectTrigger className="border-warm-200">
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
            <label className="text-sm font-medium">Parent Principal ID</label>
            <input
              type="text"
              placeholder="Enter parent's principal ID"
              value={parentPrincipal}
              onChange={(e) => setParentPrincipal(e.target.value)}
              className="w-full px-3 py-2 border border-warm-200 rounded-md text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Explain why you need permission..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] resize-none border-warm-200"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!activityType || !reason.trim() || !parentPrincipal.trim() || requestPermission.isPending}
          >
            {requestPermission.isPending ? (
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
