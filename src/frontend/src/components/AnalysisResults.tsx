import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useGetStudyTips, useGetAIReviews } from '../hooks/useQueries';
import { Loader2, Lightbulb, TrendingUp, BookOpen } from 'lucide-react';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

export default function AnalysisResults() {
  const { data: studyTips, isLoading: tipsLoading } = useGetStudyTips();
  const { data: aiReviews, isLoading: reviewsLoading } = useGetAIReviews();

  const [performanceReviews, technologyTips] = aiReviews || [[], []];

  const getAnalysisLevelLabel = (level: { basic?: null; intermediate?: null; advanced?: null }) => {
    if ('advanced' in level) return 'Advanced Analysis';
    if ('intermediate' in level) return 'Intermediate Analysis';
    return 'Basic Analysis';
  };

  return (
    <div className="space-y-6">
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warm-500" />
            Study Tips & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tipsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
            </div>
          ) : studyTips && studyTips.length > 0 ? (
            <div className="space-y-3">
              {studyTips.map((tip, index) => (
                <div key={index} className="p-4 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                  <p className="text-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Upload your study materials to receive personalized tips and recommendations.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-warm-500" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
            </div>
          ) : performanceReviews && performanceReviews.length > 0 ? (
            <div className="space-y-6">
              {performanceReviews.map((review, index) => (
                <div key={index} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {getAnalysisLevelLabel(review.aiAnalysisLevel)}
                      </Badge>
                    </div>
                    <p className="text-foreground leading-relaxed">{review.analysis}</p>
                  </div>

                  {review.recommendations && review.recommendations.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-warm-900 dark:text-warm-100">Recommended Remedies</h4>
                        {review.recommendations.map((remedy, rIndex) => (
                          <div key={rIndex} className="p-3 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                            <p className="font-medium text-warm-900 dark:text-warm-100">{remedy.remedyType}</p>
                            <p className="text-sm text-muted-foreground mt-1">{remedy.description}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {review.resourceLinks && review.resourceLinks.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-warm-900 dark:text-warm-100">Additional Resources</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {review.resourceLinks.map((link, lIndex) => (
                            <li key={lIndex}>{link}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Performance insights will appear here once your materials are analyzed.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-warm-500" />
            Technology Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
            </div>
          ) : technologyTips && technologyTips.length > 0 ? (
            <div className="space-y-3">
              {technologyTips.map((tip) => (
                <div key={tip.id} className="p-4 bg-warm-50 dark:bg-warm-950 rounded-lg border border-warm-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-warm-900 dark:text-warm-100">{tip.relevantTechnology}</p>
                      <p className="text-sm text-foreground mt-1">{tip.tipText}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(Number(tip.timestamp) / 1000000).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Technology tips will be provided to enhance your learning experience.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
