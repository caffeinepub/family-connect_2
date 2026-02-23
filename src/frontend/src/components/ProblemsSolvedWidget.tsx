import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useGetTotalProblemsSolved } from '../hooks/useQueries';
import { Loader2, Trophy } from 'lucide-react';
import { Badge } from './ui/badge';

export default function ProblemsSolvedWidget() {
  const { data: totalCount, isLoading } = useGetTotalProblemsSolved();

  const count = Number(totalCount || BigInt(0));

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-warm-900 dark:text-warm-100 flex items-center gap-2">
          <img 
            src="/assets/generated/problems-solved-icon.dim_128x128.png" 
            alt="Problems Solved" 
            className="h-6 w-6"
          />
          Problems Solved
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
              <Trophy className="h-12 w-12 text-warm-500" />
              <div>
                <div className="text-5xl font-bold text-warm-900 dark:text-warm-100">
                  {count}
                </div>
                <Badge variant="secondary" className="mt-2">
                  Total Resolved
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Family conflicts and educational problems successfully resolved
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
