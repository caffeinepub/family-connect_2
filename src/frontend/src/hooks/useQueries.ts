import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { 
  UserProfile, 
  Role,
  ExpenseCategory,
  Expenses,
  FamilyInvitation,
  MessageType,
  Message as BackendMessage,
} from '../backend';
import { ChatType } from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

// Re-export Message type from backend
export type Message = BackendMessage;

export type Location = {
  latitude: number;
  longitude: number;
  timestamp: bigint;
};

export type PermissionType = 'goOut' | 'playGames' | 'watchYouTube';

export type FileType = 'questionPaper' | 'answerScript';

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

type Update = {
  author: Principal;
  text: string;
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
      console.log('🔍 [useGetCallerUserProfile] Query starting - fetching user profile...');
      const profile = await actor.getCallerUserProfile();
      console.log('📦 [useGetCallerUserProfile] Profile fetched from backend:', {
        profile,
        hasProfile: profile !== null,
        displayName: profile?.displayName,
        role: profile?.role,
      });
      return profile;
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

export function useGetUserProfileByPrincipal(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: false,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, role }: { displayName: string; role: Role }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('💾 [useCreateProfile] Mutation starting - creating profile with:', { 
        displayName, 
        role,
      });
      const result = await actor.createProfile(displayName, role);
      console.log('✅ [useCreateProfile] Profile created successfully');
      return result;
    },
    onSuccess: () => {
      console.log('🔄 [useCreateProfile] Success callback - invalidating profile queries...');
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('❌ [useCreateProfile] Mutation failed:', error);
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      console.log('💾 [useSaveCallerUserProfile] Saving profile');
      const result = await actor.saveCallerUserProfile(profile);
      console.log('✅ [useSaveCallerUserProfile] Profile saved successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('❌ [useSaveCallerUserProfile] Failed to save profile:', error);
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      console.log('🔄 [useUpdateUserProfile] Updating profile');
      const result = await actor.updateUserProfile(profile);
      console.log('✅ [useUpdateUserProfile] Profile updated successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('❌ [useUpdateUserProfile] Failed to update profile:', error);
    },
  });
}

export function useGetAllProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

// Family Structure Management
export function useAddParent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentName, parentPrincipal }: { parentName: string; parentPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addParent(parentName, parentPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Parent added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add parent');
    },
  });
}

export function useRemoveParent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parentPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeParent(parentPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Parent removed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove parent');
    },
  });
}

export function useAddChild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childName, childPrincipal }: { childName: string; childPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addChild(childName, childPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Child added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add child');
    },
  });
}

export function useRemoveChild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeChild(childPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Child removed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove child');
    },
  });
}

// Family Invitation Queries
export function useCreateFamilyInvitation() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ childPrincipal, validationTimeHours }: { childPrincipal: Principal; validationTimeHours: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Not authenticated');
      
      const token = await actor.createFamilyInvitationToken(childPrincipal, validationTimeHours);
      return token;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create invitation');
    },
  });
}

export function useValidateFamilyInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, childPrincipal }: { token: string; childPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      const parentPrincipal = await actor.validateFamilyInvitationToken(token, childPrincipal);
      return parentPrincipal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['familyInvitations'] });
    },
  });
}

export function useGetActiveFamilyInvitations() {
  const { actor, isFetching } = useActor();

  return useQuery<FamilyInvitation[]>({
    queryKey: ['familyInvitations'],
    queryFn: async () => {
      if (!actor) return [];
      const invitations = await actor.getActiveFamilyInvitations();
      return invitations;
    },
    enabled: !!actor && !isFetching,
  });
}

// Expense Management
export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, amount }: { category: ExpenseCategory; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addExpense(category, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Expense added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add expense');
    },
  });
}

export function useGetExpenseSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<Expenses>({
    queryKey: ['expenses'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const summary = await actor.getExpenseSummary();
      return summary;
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for expense chart/analysis
export function useWeeklyExpenses() {
  return useGetExpenseSummary();
}

// Message/Chat Queries
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
      groceryItems?: string[];
      socialMediaUrl?: string;
      chatType: ChatType;
      recipientId?: Principal;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      await actor.sendMessage(
        text,
        messageType,
        groceryItems || null,
        socialMediaUrl || null,
        chatType,
        recipientId || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useGetMessageHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      const messages = await actor.getMessageHistory();
      return messages;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

// Alias for chat components
export function useGetMessages(chatType?: ChatType, recipientId?: Principal) {
  const { data: allMessages, ...rest } = useGetMessageHistory();
  
  // Filter messages based on chat type and recipient
  const filteredMessages = allMessages?.filter(msg => {
    if (chatType === ChatType.group) {
      return msg.chatType === ChatType.group;
    }
    if (chatType === ChatType.privateChat && recipientId) {
      return msg.chatType === ChatType.privateChat && 
             (msg.recipientId?.toString() === recipientId.toString() || 
              msg.author.toString() === recipientId.toString());
    }
    return true;
  });

  return { data: filteredMessages, ...rest };
}

// AI Remedy Toggle
export function useGetAIRemedyEnabled() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['aiRemedyEnabled'],
    queryFn: async () => {
      if (!actor) return true;
      return actor.getAIRemedyEnabled();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAIRemedyEnabled() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setAIRemedyEnabled(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiRemedyEnabled'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update AI remedy setting');
    },
  });
}

// Problems Solved (Fights + Educational)
export function useGetFightsSolved() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['fightsSolved'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getFightsSolved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFightsCreated() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['fightsCreated'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getFightsCreated();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTotalProblemsSolved() {
  const { data: fightsSolved } = useGetFightsSolved();
  const { data: educationalProblems } = useGetProblemsSolved();

  const total = (fightsSolved || BigInt(0)) + (educationalProblems || BigInt(0));

  return {
    data: total,
    isLoading: false,
  };
}

// Placeholder hooks for features not yet implemented in backend
export function useRequestPermission() {
  return useMutation({
    mutationFn: async (data: any) => {
      toast.info('Permission request feature coming soon!');
      throw new Error('Backend method not implemented');
    },
  });
}

export function useGetPendingPermissions() {
  return useQuery({
    queryKey: ['pendingPermissions'],
    queryFn: async () => [],
    enabled: false,
  });
}

export function useApprovePermission() {
  return useMutation({
    mutationFn: async (data: any) => {
      toast.info('Permission approval feature coming soon!');
      throw new Error('Backend method not implemented');
    },
  });
}

export function useGetFightCounters() {
  return useQuery({
    queryKey: ['fightCounters'],
    queryFn: async () => [BigInt(0), BigInt(0)] as [bigint, bigint],
    enabled: false,
  });
}

export function useUpdateFightsSolved() {
  return useMutation({
    mutationFn: async (count: number) => {
      toast.info('Fight tracking feature coming soon!');
      throw new Error('Backend method not implemented');
    },
  });
}

export function useUpdateFightsCreated() {
  return useMutation({
    mutationFn: async (count: number) => {
      toast.info('Fight tracking feature coming soon!');
      throw new Error('Backend method not implemented');
    },
  });
}

export function useGetHappinessScore() {
  return useQuery({
    queryKey: ['happinessScore'],
    queryFn: async () => 75,
  });
}

export function useGetProblemsSolved() {
  return useQuery({
    queryKey: ['problemsSolved'],
    queryFn: async () => BigInt(0),
  });
}

// Alias
export function useGetResolvedProblemsCount() {
  return useGetTotalProblemsSolved();
}

export function useGetUpdates() {
  return useQuery<Update[]>({
    queryKey: ['updates'],
    queryFn: async () => [],
  });
}

export function useGetMediaPosts() {
  return useQuery<Media[]>({
    queryKey: ['mediaPosts'],
    queryFn: async () => [],
  });
}

// Alias
export function useGetMedia() {
  return useGetMediaPosts();
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: async (data: any) => {
      toast.info('Media upload feature coming soon!');
      throw new Error('Backend method not implemented');
    },
  });
}

// Alias
export function useAddMedia() {
  return useUploadMedia();
}

export function useGetReminders() {
  return useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => [],
  });
}

export function useCreateReminder() {
  return useMutation({
    mutationFn: async (data: any) => {
      toast.info('Reminder feature coming soon!');
      throw new Error('Backend method not implemented');
    },
  });
}

// Alias
export function useAddReminder() {
  return useCreateReminder();
}

export function useGetLocations() {
  return useQuery<any[]>({
    queryKey: ['locations'],
    queryFn: async () => [],
  });
}

// Alias
export function useGetFamilyLocations() {
  return useGetLocations();
}

export function useShareLocation() {
  return useMutation({
    mutationFn: async (data: any) => {
      toast.info('Location sharing feature coming soon!');
      throw new Error('Backend method not implemented');
    },
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
  });
}

export function useUploadQuestionPaper() {
  return useMutation({
    mutationFn: async (data: any) => {
      toast.info('Educational features coming soon!');
      throw new Error('Backend method not implemented');
    },
  });
}

export function useUploadAnswerScript() {
  return useMutation({
    mutationFn: async (data: any) => {
      toast.info('Educational features coming soon!');
      throw new Error('Backend method not implemented');
    },
  });
}

export function useGetAIReviews() {
  return useQuery<[AIPerformanceReview[], ICTechnologyTip[]]>({
    queryKey: ['aiReviews'],
    queryFn: async () => [[], []],
  });
}

export function useGetTechnologyTips() {
  return useQuery<ICTechnologyTip[]>({
    queryKey: ['technologyTips'],
    queryFn: async () => [],
  });
}

export function useGetStudyTips() {
  return useQuery<string[]>({
    queryKey: ['studyTips'],
    queryFn: async () => [],
  });
}

export function useAskDoubt() {
  return useMutation({
    mutationFn: async (question: string) => {
      // Simulate AI response with parliamentary language
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return `The honourable member has raised a most pertinent inquiry. In response to the distinguished question posed, I respectfully submit the following clarification:

The matter under consideration requires careful examination of the fundamental principles involved. It is my considered opinion that a systematic approach would be most beneficial in addressing this concern.

I would humbly recommend that the honourable member consider reviewing the relevant materials and, should further clarification be required, I remain at your disposal to provide additional guidance.

With utmost respect and in the spirit of collaborative learning, I trust this response adequately addresses the inquiry presented.`;
    },
  });
}

export function useProvideAIGuidance() {
  return useMutation({
    mutationFn: async (data: any) => {
      // Placeholder for AI guidance
      return;
    },
  });
}
