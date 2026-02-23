import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { useActor } from '../hooks/useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PermissionRequest } from '../backend';

export default function PermissionApprovalInterface() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: permissionRequests, isLoading } = useQuery<PermissionRequest[]>({
    queryKey: ['permissionRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPermissionRequests();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, granted }: { requestId: string; granted: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.respondToPermissionRequest(requestId, granted);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permissionRequests'] });
      toast.success(variables.granted ? 'Permission granted!' : 'Permission denied');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process request');
    },
  });

  const handleApprove = async (requestId: string, approve: boolean) => {
    await respondMutation.mutateAsync({ requestId, granted: approve });
  };

  const getActivityLabel = (type: any) => {
    if (typeof type === 'object') {
      if ('goOut' in type) return 'Go Out';
      if ('playGames' in type) return 'Play Games';
      if ('watchYouTube' in type) return 'Watch YouTube';
    }
    return String(type);
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

  const pendingRequests = permissionRequests?.filter(req => !req.granted) || [];

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-warm-900 dark:text-warm-100 flex items-center justify-between">
          <span>Permission Requests</span>
          {pendingRequests.length > 0 && (
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
        ) : pendingRequests.length > 0 ? (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
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
                    disabled={respondMutation.isPending}
                    className="flex-1 bg-warm-500 hover:bg-warm-600"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApprove(request.id, false)}
                    disabled={respondMutation.isPending}
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
