import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Trophy, Edit2, Check, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useGetFightCounters, useUpdateFightCounters } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function FightsSolvedWidget() {
  const { data: counters } = useGetFightCounters();
  const updateCounters = useUpdateFightCounters();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const solvedCount = counters?.fightsSolved || 0;

  const handleEdit = () => {
    setEditValue(solvedCount.toString());
    setIsEditing(true);
  };

  const handleSave = async () => {
    const newValue = parseInt(editValue, 10);
    if (isNaN(newValue) || newValue < 0) {
      toast.error('Please enter a valid number');
      return;
    }

    try {
      await updateCounters.mutateAsync({ fightsSolved: newValue });
      setIsEditing(false);
      toast.success('Fight counter updated');
    } catch (error) {
      toast.error('Failed to update counter');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  return (
    <Card className="border-green-200 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-600" />
            <span>Fights Solved</span>
          </div>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-24"
              min="0"
            />
            <Button size="sm" onClick={handleSave} disabled={updateCounters.isPending}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-2xl font-bold px-4 py-2 border-green-300 text-green-700">
              {solvedCount}
            </Badge>
            <p className="text-sm text-muted-foreground">conflicts resolved</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
