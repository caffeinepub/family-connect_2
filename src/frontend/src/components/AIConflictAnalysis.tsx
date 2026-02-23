import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { RefreshCw, Lightbulb, AlertTriangle } from 'lucide-react';
import { useProvideAIGuidance } from '../hooks/useQueries';

export default function AIConflictAnalysis() {
  const [aiEnabled, setAiEnabled] = useState(false);
  const [conflicts, setConflicts] = useState<Array<{ description: string; remedy: string }>>([]);
  const provideGuidance = useProvideAIGuidance();

  useEffect(() => {
    const stored = localStorage.getItem('aiConflictAnalysisEnabled');
    if (stored) {
      setAiEnabled(stored === 'true');
    }
  }, []);

  const handleToggle = (checked: boolean) => {
    setAiEnabled(checked);
    localStorage.setItem('aiConflictAnalysisEnabled', checked.toString());
  };

  const handleAnalyze = async () => {
    // Simulate AI analysis
    const mockConflicts = [
      {
        description: 'Detected tension in recent family communications regarding screen time management.',
        remedy: 'Consider establishing a family meeting to collaboratively set clear boundaries and expectations. Ensure all parties have an opportunity to express their perspectives in a respectful manner.',
      },
      {
        description: 'Observed disagreement patterns around homework completion schedules.',
        remedy: 'Implement a structured routine with designated study periods. Provide positive reinforcement for adherence to the schedule and maintain open dialogue about challenges.',
      },
    ];
    
    setConflicts(mockConflicts);
    
    // Call backend for logging
    try {
      await provideGuidance.mutateAsync({ 
        doubt: 'Family conflict analysis performed', 
        context: 'AI conflict detection and remedy suggestion' 
      });
    } catch (error) {
      console.error('Failed to log AI guidance:', error);
    }
  };

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-warm-900 dark:text-warm-100">
          AI Conflict Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-warm-50 dark:bg-warm-900 rounded-lg">
          <Label htmlFor="ai-toggle" className="cursor-pointer">
            <div className="font-medium">Enable AI Analysis</div>
            <div className="text-xs text-muted-foreground">
              Analyze chat for family conflicts
            </div>
          </Label>
          <Switch
            id="ai-toggle"
            checked={aiEnabled}
            onCheckedChange={handleToggle}
          />
        </div>

        {aiEnabled && (
          <>
            <Button
              onClick={handleAnalyze}
              className="w-full"
              variant="outline"
              disabled={provideGuidance.isPending}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${provideGuidance.isPending ? 'animate-spin' : ''}`} />
              Analyze Conversations
            </Button>

            {conflicts.length > 0 && (
              <div className="space-y-3 mt-4">
                <h4 className="text-sm font-semibold text-warm-900 dark:text-warm-100">
                  Detected Conflicts & Remedies
                </h4>
                {conflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className="p-4 border border-warm-200 rounded-lg space-y-3 bg-white dark:bg-warm-950"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-warm-900 dark:text-warm-100 mb-2">
                          {conflict.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 pl-7">
                      <Lightbulb className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {conflict.remedy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!aiEnabled && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Enable AI analysis to detect and receive guidance on family conflicts
          </p>
        )}
      </CardContent>
    </Card>
  );
}
