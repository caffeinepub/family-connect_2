import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useGetHappinessScore } from '../hooks/useQueries';
import { Loader2, Smile, Meh, Frown } from 'lucide-react';

export default function HappinessMeter() {
  const { data: happinessScore, isLoading } = useGetHappinessScore();

  const getHappinessColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHappinessIcon = (score: number) => {
    if (score >= 70) return <Smile className="h-8 w-8" />;
    if (score >= 40) return <Meh className="h-8 w-8" />;
    return <Frown className="h-8 w-8" />;
  };

  const score = happinessScore || 75;

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-warm-900 dark:text-warm-100 flex items-center gap-2">
          <img 
            src="/assets/generated/happiness-meter.dim_300x300.png" 
            alt="Happiness Meter" 
            className="h-6 w-6"
          />
          Family Happiness Meter
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-3 ${getHappinessColor(score)}`}>
                {getHappinessIcon(score)}
                <span className="text-4xl font-bold">{score}%</span>
              </div>
            </div>
            <div className="w-full bg-warm-200 dark:bg-warm-800 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getProgressColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Based on family communications and interactions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
