import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAskDoubt, useMarkProblemResolved, useGetEducationalData } from '../hooks/useQueries';
import { Loader2, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { Separator } from './ui/separator';

export default function DoubtClearingInterface() {
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState<Array<{ question: string; answer: string; timestamp: Date }>>([]);
  
  const askDoubt = useAskDoubt();
  const markResolved = useMarkProblemResolved();
  const { data: educationalData } = useGetEducationalData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion('');

    const answer = await askDoubt.mutateAsync(currentQuestion);
    
    setResponses(prev => [...prev, {
      question: currentQuestion,
      answer,
      timestamp: new Date(),
    }]);
  };

  const handleMarkResolved = async () => {
    await markResolved.mutateAsync();
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-warm-500" />
            Ask Your Doubts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="I respectfully request clarification regarding..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px] resize-none border-warm-200"
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!question.trim() || askDoubt.isPending}
                className="flex-1"
              >
                {askDoubt.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Question
                  </>
                )}
              </Button>
              {responses.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMarkResolved}
                  disabled={markResolved.isPending}
                >
                  {markResolved.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Resolved
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {responses.length > 0 && (
        <Card className="border-warm-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-warm-900 dark:text-warm-100">Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {responses.map((response, index) => (
                <div key={index} className="space-y-3">
                  <div className="bg-warm-100 dark:bg-warm-900 p-4 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-semibold text-warm-900 dark:text-warm-100">Your Question</span>
                      <span className="text-xs text-muted-foreground">{formatTime(response.timestamp)}</span>
                    </div>
                    <p className="text-foreground">{response.question}</p>
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-semibold text-primary">AI Response</span>
                      <span className="text-xs text-muted-foreground">{formatTime(response.timestamp)}</span>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{response.answer}</p>
                  </div>
                  
                  {index < responses.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {educationalData?.doubts && educationalData.doubts.length > 0 && (
        <Card className="border-warm-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-warm-900 dark:text-warm-100">Previous Doubts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {educationalData.doubts.map((doubt, index) => (
                <div key={index} className="p-3 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                  <p className="text-sm text-foreground">{doubt}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
