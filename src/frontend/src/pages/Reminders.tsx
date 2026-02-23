import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useGetReminders, useAddReminder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function Reminders() {
  const [reminderText, setReminderText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { identity } = useInternetIdentity();
  const { data: reminders, isLoading } = useGetReminders();
  const addReminder = useAddReminder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderText.trim() || !dueDate) return;

    const dueDateBigInt = BigInt(new Date(dueDate).getTime() * 1000000);
    await addReminder.mutateAsync({ text: reminderText, dueDate: dueDateBigInt });
    setReminderText('');
    setDueDate('');
  };

  const getReminderStatus = (dueDate: bigint) => {
    const now = Date.now();
    const due = Number(dueDate) / 1000000;
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950' };
    if (diffDays <= 2) return { label: 'Due Soon', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950' };
    return { label: 'Upcoming', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-950' };
  };

  const sortedReminders = reminders?.sort((a, b) => Number(a.dueDate) - Number(b.dueDate)) || [];

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-warm-200 shadow-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Please log in to view and create reminders</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-2">Family Reminders</h1>
        <p className="text-muted-foreground">Keep track of important family events and tasks</p>
      </div>

      <Card className="border-warm-200 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <Plus className="h-5 w-5 text-warm-500" />
            Create New Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="What do you want to remember?"
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="border-warm-200"
            />
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border-warm-200"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={!reminderText.trim() || !dueDate || addReminder.isPending}
            >
              {addReminder.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reminder
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-warm-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-warm-500" />
            All Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-warm-500" />
            </div>
          ) : sortedReminders.length > 0 ? (
            <div className="space-y-3">
              {sortedReminders.map((reminder, index) => {
                const status = getReminderStatus(reminder.dueDate);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border border-warm-200 ${status.bgColor}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-warm-900 dark:text-warm-100 mb-2">
                          {reminder.text}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(Number(reminder.dueDate) / 1000000).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label === 'Overdue' && <AlertCircle className="h-3 w-3" />}
                        {status.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No reminders yet. Create one to get started!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
