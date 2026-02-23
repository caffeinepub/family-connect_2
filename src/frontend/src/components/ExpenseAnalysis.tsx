import { useWeeklyExpenses } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react';

export default function ExpenseAnalysis() {
  const { data: expenses, isLoading } = useWeeklyExpenses();

  if (isLoading) {
    return (
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100">Spending Insights</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
        </CardContent>
      </Card>
    );
  }

  const totalFees = Number(expenses?.totalFees || 0);
  const totalGroceries = Number(expenses?.totalGroceries || 0);
  const totalOther = Number(expenses?.totalOther || 0);
  const totalExpenses = totalFees + totalGroceries + totalOther;

  // Calculate percentages
  const feesPercent = totalExpenses > 0 ? (totalFees / totalExpenses) * 100 : 0;
  const groceriesPercent = totalExpenses > 0 ? (totalGroceries / totalExpenses) * 100 : 0;
  const otherPercent = totalExpenses > 0 ? (totalOther / totalExpenses) * 100 : 0;

  // Generate insights
  const insights: Array<{ type: 'tip' | 'warning' | 'success'; text: string; category?: string }> = [];

  if (totalExpenses === 0) {
    insights.push({
      type: 'tip',
      text: 'Start tracking your expenses to get personalized insights and recommendations.',
    });
  } else {
    // Identify highest spending category
    const categories = [
      { name: 'Fees', value: totalFees, percent: feesPercent },
      { name: 'Groceries', value: totalGroceries, percent: groceriesPercent },
      { name: 'Other', value: totalOther, percent: otherPercent },
    ];
    const highest = categories.reduce((max, cat) => (cat.value > max.value ? cat : max));

    if (highest.percent > 50) {
      insights.push({
        type: 'warning',
        text: `${highest.name} account for ${highest.percent.toFixed(0)}% of your spending. Consider reviewing this category for potential savings.`,
        category: highest.name,
      });
    }

    // Groceries-specific tips
    if (groceriesPercent > 35) {
      insights.push({
        type: 'tip',
        text: 'Grocery spending is above average. Try meal planning, buying in bulk, and using shopping lists to reduce waste and save money.',
        category: 'Groceries',
      });
    } else if (groceriesPercent > 0 && groceriesPercent < 20) {
      insights.push({
        type: 'success',
        text: 'Great job keeping grocery costs under control! Your spending is well-managed in this category.',
        category: 'Groceries',
      });
    }

    // Fees-specific tips
    if (feesPercent > 40) {
      insights.push({
        type: 'tip',
        text: 'Fees are your largest expense. Review subscriptions, memberships, and recurring charges for services you may no longer need.',
        category: 'Fees',
      });
    }

    // Other expenses tips
    if (otherPercent > 30) {
      insights.push({
        type: 'tip',
        text: 'Other expenses are significant. Track these more closely to identify patterns and opportunities for savings.',
        category: 'Other',
      });
    }

    // General savings tips
    if (totalExpenses > 50000) {
      insights.push({
        type: 'tip',
        text: 'Consider setting a weekly budget for each category to better control spending and build savings.',
      });
    }

    // Balanced spending
    if (feesPercent < 35 && groceriesPercent < 35 && otherPercent < 35) {
      insights.push({
        type: 'success',
        text: 'Your spending is well-balanced across categories. Keep up the good financial habits!',
      });
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <TrendingDown className="h-4 w-4" />;
      case 'tip':
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'warning':
        return 'destructive';
      case 'success':
        return 'default';
      case 'tip':
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Spending Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Add expenses to receive personalized insights and recommendations.
            </p>
          ) : (
            insights.map((insight, index) => (
              <div
                key={index}
                className="flex gap-3 p-4 bg-warm-50 dark:bg-warm-900 rounded-lg border border-warm-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
                    {insight.category && (
                      <Badge variant={getBadgeVariant(insight.type)} className="flex-shrink-0">
                        {insight.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
