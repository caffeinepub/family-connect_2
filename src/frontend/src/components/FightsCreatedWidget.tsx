import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Loader2, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import { useGetFightCounters, useUpdateFightsCreated } from '../hooks/useQueries';

export default function FightsCreatedWidget() {
  const { data: counters, isLoading } = useGetFightCounters();
  const updateCreated = useUpdateFightsCreated();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const createdCount = Number(counters?.[1] || BigInt(0));

  const handleEdit = () => {
    setEditValue(createdCount.toString());
    setIsEditing(true);
  };

  const handleSave = async () => {
    const newValue = parseInt(editValue, 10);
    if (isNaN(newValue) || newValue < 0) return;

    // Calculate difference and update
    const difference = newValue - createdCount;
    for (let i = 0; i < Math.abs(difference); i++) {
      await updateCreated.mutateAsync(newValue);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-warm-900 dark:text-warm-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Fights Created
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 text-2xl font-bold"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSave} disabled={updateCreated.isPending}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="text-5xl font-bold text-amber-600 dark:text-amber-400">
                      {createdCount}
                    </div>
                    <Button size="sm" variant="ghost" onClick={handleEdit}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Badge variant="secondary" className="mt-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                  Detected Conflicts
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Family conflicts detected through AI analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
