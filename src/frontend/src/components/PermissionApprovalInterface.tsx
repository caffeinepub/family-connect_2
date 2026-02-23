import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useGetPendingPermissions, useApprovePermission } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function PermissionApprovalInterface() {
  const { data: permissions, isLoading } = useGetPendingPermissions();
  const approvePermission = useApprovePermission();

  useEffect(() => {
    console.log('🔍 [PermissionApprovalInterface] Component mounted');
    return () => {
      console.log('🔍 [PermissionApprovalInterface] Component unmounted');
    };
  }, []);

  const handleApprove = async (requestId: string, approved: boolean) => {
    try {
      await approvePermission.mutateAsync({ requestId, approved });
      toast.success(approved ? 'Permission approved' : 'Permission denied');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process permission');
    }
  };

  if (isLoading) {
    return (
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Permission Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-warm-500" />
          Permission Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!permissions || permissions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending permission requests
          </p>
        ) : (
          <div className="space-y-3">
            {permissions.map((request: any) => (
              <div key={request.id} className="border border-warm-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="mb-2">
                      {request.requestType}
                    </Badge>
                    <p className="text-sm font-medium">{request.childName}</p>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(request.id, true)}
                    disabled={approvePermission.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApprove(request.id, false)}
                    disabled={approvePermission.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
