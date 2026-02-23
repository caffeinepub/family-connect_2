import { useState } from 'react';
import { useAddExpense, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Plus } from 'lucide-react';
import { ExpenseCategory, Role } from '../backend';
import { toast } from 'sonner';

export default function ExpenseInput() {
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.groceries);
  const [amount, setAmount] = useState('');
  const { data: userProfile } = useGetCallerUserProfile();
  const addExpense = useAddExpense();

  // Only show for parents
  if (userProfile?.role !== Role.parent) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await addExpense.mutateAsync({
        category,
        amount: BigInt(Math.round(amountNum)),
      });
      toast.success('Expense added successfully');
      setAmount('');
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast.error('Failed to add expense');
    }
  };

  return (
    <Card className="border-warm-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-warm-900 dark:text-warm-100">Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ExpenseCategory)}
            >
              <SelectTrigger id="category" className="border-warm-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ExpenseCategory.fees}>Fees</SelectItem>
                <SelectItem value={ExpenseCategory.groceries}>Groceries</SelectItem>
                <SelectItem value={ExpenseCategory.other}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-warm-200"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={!amount || addExpense.isPending}
            className="w-full"
          >
            {addExpense.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
