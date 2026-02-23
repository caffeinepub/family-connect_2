import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RefreshCw, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import { useGetMessageHistory, useGetAIRemedyEnabled, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Role } from '../backend';

type Conflict = {
  description: string;
  remedy: string;
};

export default function AIConflictAnalysis() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { data: aiRemedyEnabled, isLoading: toggleLoading } = useGetAIRemedyEnabled();
  const { data: messages, isLoading: messagesLoading } = useGetMessageHistory();
  const { data: userProfile } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();

  const isParent = userProfile?.role === Role.parent;

  // Generate parliamentary language remedies based on chat analysis
  const analyzeMessages = () => {
    if (!messages || messages.length === 0) {
      setConflicts([]);
      return;
    }

    setIsAnalyzing(true);

    // Simulate AI analysis with parliamentary language
    setTimeout(() => {
      const detectedConflicts: Conflict[] = [];

      // Analyze message patterns
      const recentMessages = messages.slice(-20);
      const messageTexts = recentMessages.map(m => m.text.toLowerCase());

      // Pattern detection with parliamentary remedies
      if (messageTexts.some(text => text.includes('homework') || text.includes('study'))) {
        detectedConflicts.push({
          description: 'The honourable members appear to have differing perspectives regarding academic responsibilities and study schedules.',
          remedy: 'It is respectfully proposed that the family convene a formal discussion to establish mutually agreeable study protocols. The Chair suggests implementing a structured timetable with designated periods for academic pursuits, ensuring all parties have the opportunity to voice their concerns in an orderly manner.',
        });
      }

      if (messageTexts.some(text => text.includes('screen') || text.includes('phone') || text.includes('game'))) {
        detectedConflicts.push({
          description: 'Distinguished members have expressed concerns pertaining to the regulation of electronic device usage within the household.',
          remedy: 'The committee recommends establishing clear guidelines regarding screen time allocation. It is proposed that all stakeholders participate in drafting a family technology policy, with provisions for reasonable recreational periods whilst maintaining appropriate boundaries. The motion should be carried with the consent of all parties.',
        });
      }

      if (messageTexts.some(text => text.includes('late') || text.includes('time') || text.includes('curfew'))) {
        detectedConflicts.push({
          description: 'Observations indicate a divergence of opinion concerning temporal arrangements and scheduling matters.',
          remedy: 'The assembly is advised to deliberate upon establishing a comprehensive schedule that accommodates the legitimate interests of all family members. It is suggested that reasonable time allocations be determined through collaborative discourse, with due consideration given to both parental guidance and individual autonomy.',
        });
      }

      if (detectedConflicts.length === 0 && messages.length > 5) {
        detectedConflicts.push({
          description: 'The parliamentary review has noted generally harmonious communications among the distinguished members of this household.',
          remedy: 'The Chair commends the family for maintaining respectful discourse. It is recommended that regular family assemblies continue to be convened to address matters of mutual concern, thereby preserving the cordial relations currently observed. The committee encourages continued dialogue and mutual understanding.',
        });
      }

      setConflicts(detectedConflicts);
      setIsAnalyzing(false);
    }, 1500);
  };

  if (!identity || !isParent) {
    return null;
  }

  if (toggleLoading) {
    return (
      <Card className="border-warm-200 shadow-md">
        <CardContent className="py-12">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!aiRemedyEnabled) {
    return (
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg text-warm-900 dark:text-warm-100">
            AI Conflict Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            AI remedy analysis is currently disabled. Enable it in Settings to receive parliamentary guidance on family matters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-warm-900 dark:text-warm-100">
          AI Conflict Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-warm-50 dark:bg-warm-900 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Parliamentary AI analysis reviews family communications and provides dignified remedies using formal parliamentary language.
          </p>
        </div>

        <Button
          onClick={analyzeMessages}
          className="w-full"
          variant="outline"
          disabled={isAnalyzing || messagesLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing Conversations...' : 'Analyze Family Communications'}
        </Button>

        {conflicts.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold text-warm-900 dark:text-warm-100">
              Parliamentary Review & Remedies
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
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {conflict.remedy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {conflicts.length === 0 && !isAnalyzing && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No analysis results yet. Click the button above to analyze recent family communications.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
