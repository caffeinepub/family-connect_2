import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Users, User } from 'lucide-react';
import { Role } from '../backend';

export default function FamilyMemberGrid() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <Card className="border-warm-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading family members...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile) {
    return null;
  }

  const allMembers = [
    ...userProfile.parents.map(p => ({ ...p, role: 'parent' as const })),
    ...userProfile.children.map(c => ({ ...c, role: 'child' as const })),
  ].slice(0, 4);

  if (allMembers.length === 0) {
    return (
      <Card className="border-warm-200">
        <CardContent className="p-6">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No family members yet. Invite them from Settings!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warm-200 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-warm-600" />
          <h3 className="font-semibold text-warm-900 dark:text-warm-100">Family Members</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allMembers.map((member) => {
            const initials = member.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={member.principal.toString()}
                className="flex items-center gap-3 p-3 rounded-lg border border-warm-200 bg-white dark:bg-warm-900 hover:shadow-md transition-shadow"
              >
                <Avatar className="h-12 w-12 border-2 border-warm-300">
                  <AvatarFallback className="bg-gradient-to-br from-warm-400 to-warm-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-warm-900 dark:text-warm-100 truncate">
                    {member.name}
                  </p>
                  <Badge 
                    variant={member.role === 'parent' ? 'default' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    <User className="h-3 w-3 mr-1" />
                    {member.role === 'parent' ? 'Parent' : 'Child'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
