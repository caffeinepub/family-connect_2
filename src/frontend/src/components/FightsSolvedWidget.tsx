import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Loader2, Trophy, Edit2, Check, X } from 'lucide-react';
import { useGetFightCounters, useUpdateFightsSolved } from '../hooks/useQueries';

export default function FightsSolvedWidget() {
  const { data: counters, isLoading } = useGetFightCounters();
  const updateSolved = useUpdateFightsSolved();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const solvedCount = Number(counters?.[0] || BigInt(0));

  const handleEdit = () => {
    setEditValue(solvedCount.toString());
    setIsEditing(true);
  };

  const handleSave = async () => {
    const newValue = parseInt(editValue, 10);
    if (isNaN(newValue) || newValue < 0) return;

    // Calculate difference and update
    const difference = newValue - solvedCount;
    for (let i = 0; i < Math.abs(difference); i++) {
      await updateSolved.mutateAsync(newValue);
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
          <Trophy className="h-5 w-5 text-green-500" />
          Fights Solved
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
              <Trophy className="h-12 w-12 text-green-500" />
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
                    <Button size="sm" onClick={handleSave} disabled={updateSolved.isPending}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                      {solvedCount}
                    </div>
                    <Button size="sm" variant="ghost" onClick={handleEdit}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Resolved Conflicts
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Family conflicts successfully resolved through communication
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
