import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  Role,
  ExpenseCategory,
  Expenses,
  Message,
  MessageType,
  ChatType,
  FamilyInvitation,
} from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// Re-export types for use in components
export type { Message };

export type PermissionType = 'goOut' | 'playGames' | 'watchYouTube';

export type Location = {
  latitude: number;
  longitude: number;
  timestamp: bigint;
};

type QuestionPaper = {
  id: string;
  title: string;
  uploadedBy: Principal;
  uploadTimestamp: bigint;
  file: ExternalBlob;
};

type AnswerScript = {
  id: string;
  student: Principal;
  uploadTimestamp: bigint;
  file: ExternalBlob;
};

type EducationalData = {
  classroomCommunication: string[];
  questionPapers: QuestionPaper[];
  answerScripts: AnswerScript[];
  insights: string[];
  doubts: string[];
  resolvedProblems: bigint;
  studyTips: string[];
  academicReminders: string[];
};

type ProblemRemedy = {
  description: string;
  remedyType: string;
};

type AIPerformanceReview = {
  analysis: string;
  recommendations: ProblemRemedy[];
  aiAnalysisLevel: { basic?: null; intermediate?: null; advanced?: null };
  resourceLinks: string[];
};

type ICTechnologyTip = {
  id: string;
  tipText: string;
  relevantTechnology: string;
  timestamp: bigint;
};

type Media = {
  author: Principal;
  file: ExternalBlob;
  timestamp: bigint;
  description: string;
};

type Reminder = {
  creator: Principal;
  text: string;
  dueDate: bigint;
  timestamp: bigint;
};

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, role }: { displayName: string; role: Role }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProfile(displayName, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create profile: ${error.message}`);
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

export function useAddParent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentName, parentPrincipal }: { parentName: string; parentPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addParent(parentName, parentPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Parent added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add parent: ${error.message}`);
    },
  });
}

export function useRemoveParent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parentPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeParent(parentPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Parent removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove parent: ${error.message}`);
    },
  });
}

export function useAddChild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childName, childPrincipal }: { childName: string; childPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addChild(childName, childPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Child added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add child: ${error.message}`);
    },
  });
}

export function useRemoveChild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeChild(childPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Child removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove child: ${error.message}`);
    },
  });
}

export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, amount }: { category: ExpenseCategory; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addExpense(category, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseSummary'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Expense added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add expense: ${error.message}`);
    },
  });
}

export function useGetExpenseSummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Expenses>({
    queryKey: ['expenseSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getExpenseSummary();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useWeeklyExpenses() {
  const { data: expenseSummary } = useGetExpenseSummary();
  return useQuery({
    queryKey: ['weeklyExpenses'],
    queryFn: () => expenseSummary || { entries: [], totalFees: BigInt(0), totalGroceries: BigInt(0), totalOther: BigInt(0) },
    enabled: !!expenseSummary,
  });
}

export function useCreateFamilyInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ child, validationTimeHours }: { child: Principal; validationTimeHours: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createFamilyInvitationToken(child, validationTimeHours);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeFamilyInvitations'] });
      toast.success('Invitation created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create invitation: ${error.message}`);
    },
  });
}

export function useValidateFamilyInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, child }: { token: string; child: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.validateFamilyInvitationToken(token, child);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['activeFamilyInvitations'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to validate invitation: ${error.message}`);
    },
  });
}

export function useGetActiveFamilyInvitations() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FamilyInvitation[]>({
    queryKey: ['activeFamilyInvitations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getActiveFamilyInvitations();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      messageType,
      groceryItems,
      socialMediaUrl,
      chatType,
      recipientId,
    }: {
      text: string;
      messageType: MessageType;
      groceryItems: string[] | null;
      socialMediaUrl: string | null;
      chatType: ChatType;
      recipientId: Principal | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(text, messageType, groceryItems, socialMediaUrl, chatType, recipientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageHistory'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
}

export function useGetMessageHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messageHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMessageHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMessages(chatType?: ChatType, recipientId?: Principal) {
  return useGetMessageHistory();
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAccount();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
  });
}

// Placeholder hooks for features not yet implemented in backend
export function useGetMedia() {
  return useQuery<Media[]>({
    queryKey: ['mediaPosts'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { file: ExternalBlob; description: string }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaPosts'] });
    },
  });
}

export function useGetAllProfiles() {
  return useQuery<UserProfile[]>({
    queryKey: ['allProfiles'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetReminders() {
  return useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAddReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { text: string; dueDate: bigint }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useShareLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { latitude: number; longitude: number; timestamp: bigint }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyLocations'] });
    },
  });
}

export function useGetFamilyLocations() {
  return useQuery<Location[]>({
    queryKey: ['familyLocations'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetEducationalData() {
  return useQuery<EducationalData>({
    queryKey: ['educationalData'],
    queryFn: async () => ({
      classroomCommunication: [],
      questionPapers: [],
      answerScripts: [],
      insights: [],
      doubts: [],
      resolvedProblems: BigInt(0),
      studyTips: [],
      academicReminders: [],
    }),
    enabled: false,
  });
}

export function useUploadQuestionPaper() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { title: string; file: ExternalBlob }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useUploadAnswerScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { file: ExternalBlob }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useGetAIReviews() {
  return useQuery<AIPerformanceReview[]>({
    queryKey: ['aiPerformanceReviews'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetICTechnologyTips() {
  return useQuery<ICTechnologyTip[]>({
    queryKey: ['icTechnologyTips'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useGetStudyTips() {
  return useQuery<string[]>({
    queryKey: ['studyTips'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useAskDoubt() {
  return useMutation({
    mutationFn: async (_doubt: string): Promise<string> => {
      throw new Error('Backend implementation not available yet');
    },
  });
}

export function useProvideAIGuidance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { doubt: string; context: string }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiPerformanceReviews'] });
    },
  });
}

export function useGetHappinessScore() {
  return useQuery<number>({
    queryKey: ['happinessScore'],
    queryFn: async () => 75,
    enabled: false,
  });
}

export function useGetResolvedProblemsCount() {
  const { data: educationalData } = useGetEducationalData();
  return useQuery<bigint>({
    queryKey: ['resolvedProblemsCount'],
    queryFn: () => educationalData?.resolvedProblems || BigInt(0),
    enabled: !!educationalData,
  });
}

export function useRequestPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { requestId: string; requestType: PermissionType; reason: string; parent: Principal }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPermissions'] });
    },
  });
}

export function useGetPendingPermissions() {
  return useQuery<any[]>({
    queryKey: ['pendingPermissions'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useApprovePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { requestId: string; approved: boolean }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPermissions'] });
    },
  });
}

export function useGetFightCounters() {
  return useQuery<{ fightsSolved: number; fightsCreated: number }>({
    queryKey: ['fightCounters'],
    queryFn: async () => ({ fightsSolved: 0, fightsCreated: 0 }),
    enabled: false,
  });
}

export function useUpdateFightCounters() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { fightsSolved?: number; fightsCreated?: number }) => {
      throw new Error('Backend implementation not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fightCounters'] });
    },
  });
}
