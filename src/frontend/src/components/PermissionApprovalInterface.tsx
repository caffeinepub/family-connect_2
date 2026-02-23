import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useGetPendingPermissions, useApprovePermission } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function PermissionApprovalInterface() {
  const { data: pendingRequests, isLoading } = useGetPendingPermissions();
  const approvePermission = useApprovePermission();

  // Debug logging when component mounts/unmounts and when data changes
  useEffect(() => {
    console.log('👨‍👩‍👧 [PermissionApprovalInterface] Component mounted - user is parent');
    return () => {
      console.log('👨‍👩‍👧 [PermissionApprovalInterface] Component unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('📋 [PermissionApprovalInterface] Pending requests:', {
      pendingRequests,
      isLoading,
      count: pendingRequests?.length || 0,
    });
  }, [pendingRequests, isLoading]);

  const handleApprove = async (requestId: string, approve: boolean) => {
    console.log(`${approve ? '✅' : '❌'} [PermissionApprovalInterface] ${approve ? 'Approving' : 'Denying'} request:`, requestId);
    
    try {
      await approvePermission.mutateAsync({ requestId, approve });
      toast.success(approve ? 'Permission granted!' : 'Permission denied');
      console.log('✅ [PermissionApprovalInterface] Action completed successfully');
    } catch (error) {
      console.error('❌ [PermissionApprovalInterface] Failed to process request:', error);
      toast.error('Failed to process request');
    }
  };

  const getActivityLabel = (type: string) => {
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

  const formatTimestamp = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-warm-900 dark:text-warm-100 flex items-center justify-between">
          <span>Permission Requests</span>
          {pendingRequests && pendingRequests.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingRequests.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
          </div>
        ) : pendingRequests && pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request: any) => (
              <div
                key={request.id}
                className="p-4 border border-warm-200 rounded-lg bg-warm-50 dark:bg-warm-900"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getActivityLabel(request.requestType)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {formatTimestamp(request.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-2">{request.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      From: {request.child.toString().slice(0, 10)}...
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(request.id, true)}
                    disabled={approvePermission.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApprove(request.id, false)}
                    disabled={approvePermission.isPending}
                    className="flex-1"
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No pending permission requests
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
