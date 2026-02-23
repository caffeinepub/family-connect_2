import { useWeeklyExpenses } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2 } from 'lucide-react';

export default function ExpenseChart() {
  const { data: expenses, isLoading, error } = useWeeklyExpenses();

  if (isLoading) {
    return (
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100">Weekly Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100">Weekly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">Failed to load expense data</p>
        </CardContent>
      </Card>
    );
  }

  const totalFees = Number(expenses?.totalFees || 0);
  const totalGroceries = Number(expenses?.totalGroceries || 0);
  const totalOther = Number(expenses?.totalOther || 0);
  const maxValue = Math.max(totalFees, totalGroceries, totalOther, 1);

  const categories = [
    { name: 'Fees', value: totalFees, color: 'bg-chart-1', textColor: 'text-chart-1' },
    { name: 'Groceries', value: totalGroceries, color: 'bg-chart-2', textColor: 'text-chart-2' },
    { name: 'Other', value: totalOther, color: 'bg-chart-3', textColor: 'text-chart-3' },
  ];

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-warm-900 dark:text-warm-100">Weekly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => {
            const percentage = maxValue > 0 ? (category.value / maxValue) * 100 : 0;
            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                  <span className={`text-sm font-semibold ${category.textColor}`}>
                    ₹{category.value.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`h-full ${category.color} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-medium text-white">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="pt-4 border-t border-warm-200">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="text-base font-bold text-primary">
                ₹{(totalFees + totalGroceries + totalOther).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
