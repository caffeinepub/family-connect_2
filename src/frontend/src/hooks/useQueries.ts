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
} from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob } from '../backend';

// Define and EXPORT types that are not exported from backend
export type Message = {
  author: Principal;
  receiver: Principal;
  text: string;
  messageType: MessageType;
  groceryItems?: string[];
  socialMediaUrl?: string;
  timestamp: bigint;
};

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
        roleType: typeof profile?.role,
        roleIsNull: profile?.role === null,
        roleIsUndefined: profile?.role === undefined,
      });
      return profile;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  console.log('🔄 [useGetCallerUserProfile] Query state:', {
    actorAvailable: !!actor,
    actorFetching,
    queryIsLoading: query.isLoading,
    queryIsFetched: query.isFetched,
    queryIsFetching: query.isFetching,
    combinedIsLoading: actorFetching || query.isLoading,
    combinedIsFetched: !!actor && query.isFetched,
    data: query.data,
    dataIsNull: query.data === null,
    dataIsUndefined: query.data === undefined,
    error: query.error,
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
      console.log('💾 [useCreateProfile] Mutation starting - creating profile with:', { 
        displayName, 
        role,
        roleType: typeof role,
      });
      const result = await actor.createProfile(displayName, role);
      console.log('✅ [useCreateProfile] Profile created successfully, backend response:', result);
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
      console.log('💾 [useSaveCallerUserProfile] Saving profile:', {
        profile,
        role: profile.role,
        roleType: typeof profile.role,
      });
      const result = await actor.saveCallerUserProfile(profile);
      console.log('✅ [useSaveCallerUserProfile] Profile saved successfully');
      return result;
    },
    onSuccess: () => {
      console.log('🔄 [useSaveCallerUserProfile] Invalidating profile queries...');
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
      console.log('🔄 [useUpdateUserProfile] Updating profile:', {
        profile,
        role: profile.role,
        roleType: typeof profile.role,
      });
      const result = await actor.updateUserProfile(profile);
      console.log('✅ [useUpdateUserProfile] Profile updated successfully');
      return result;
    },
    onSuccess: () => {
      console.log('🔄 [useUpdateUserProfile] Invalidating profile queries...');
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
      // Backend doesn't have getAllProfiles, return empty array
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
      console.log('👨‍👩‍👧 [useAddParent] Adding parent:', { parentName, parentPrincipal: parentPrincipal.toString() });
      await actor.addParent(parentName, parentPrincipal);
      console.log('✅ [useAddParent] Parent added successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('❌ [useAddParent] Failed to add parent:', error);
    },
  });
}

export function useRemoveParent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (parentPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      console.log('🗑️ [useRemoveParent] Removing parent:', parentPrincipal.toString());
      await actor.removeParent(parentPrincipal);
      console.log('✅ [useRemoveParent] Parent removed successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('❌ [useRemoveParent] Failed to remove parent:', error);
    },
  });
}

export function useAddChild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ childName, childPrincipal }: { childName: string; childPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('👶 [useAddChild] Adding child:', { childName, childPrincipal: childPrincipal.toString() });
      await actor.addChild(childName, childPrincipal);
      console.log('✅ [useAddChild] Child added successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('❌ [useAddChild] Failed to add child:', error);
    },
  });
}

export function useRemoveChild() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      console.log('🗑️ [useRemoveChild] Removing child:', childPrincipal.toString());
      await actor.removeChild(childPrincipal);
      console.log('✅ [useRemoveChild] Child removed successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('❌ [useRemoveChild] Failed to remove child:', error);
    },
  });
}

// Family Invitation Queries
export function useCreateFamilyInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ validationTimeHours, roleType }: { validationTimeHours: bigint; roleType: 'parent' | 'child' }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('🎟️ [useCreateFamilyInvitation] Creating invitation:', { validationTimeHours, roleType });
      
      // For now, we'll use a placeholder principal for the child parameter
      // The backend expects a child principal, but we'll generate a token that can be used by anyone
      const placeholderPrincipal = Principal.fromText('2vxsx-fae');
      const token = await actor.createFamilyInvitationToken(placeholderPrincipal, validationTimeHours);
      
      console.log('✅ [useCreateFamilyInvitation] Invitation created:', token);
      return token;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyInvitations'] });
    },
    onError: (error) => {
      console.error('❌ [useCreateFamilyInvitation] Failed to create invitation:', error);
    },
  });
}

export function useValidateFamilyInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, childPrincipal }: { token: string; childPrincipal: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('✅ [useValidateFamilyInvitation] Validating invitation:', { token, childPrincipal: childPrincipal.toString() });
      const parentPrincipal = await actor.validateFamilyInvitationToken(token, childPrincipal);
      console.log('✅ [useValidateFamilyInvitation] Invitation validated, parent:', parentPrincipal.toString());
      return parentPrincipal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['familyInvitations'] });
    },
    onError: (error) => {
      console.error('❌ [useValidateFamilyInvitation] Failed to validate invitation:', error);
    },
  });
}

export function useGetActiveFamilyInvitations() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<FamilyInvitation[]>({
    queryKey: ['familyInvitations'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      console.log('🔍 [useGetActiveFamilyInvitations] Fetching active invitations...');
      const invitations = await actor.getActiveFamilyInvitations();
      console.log('📦 [useGetActiveFamilyInvitations] Invitations fetched:', invitations);
      return invitations;
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Expense Tracking
export function useAddExpense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, amount }: { category: ExpenseCategory; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('💰 [useAddExpense] Adding expense:', { category, amount: amount.toString() });
      await actor.addExpense(category, amount);
      console.log('✅ [useAddExpense] Expense added successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error) => {
      console.error('❌ [useAddExpense] Failed to add expense:', error);
    },
  });
}

export function useWeeklyExpenses() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Expenses>({
    queryKey: ['weeklyExpenses'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('📊 [useWeeklyExpenses] Fetching expense summary...');
      const expenses = await actor.getExpenseSummary();
      console.log('📦 [useWeeklyExpenses] Expenses fetched:', expenses);
      return expenses;
    },
    enabled: !!actor && !actorFetching,
  });
}

// Permission Queries
export function useRequestPermission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      requestType, 
      reason, 
      parent 
    }: { 
      requestId: string; 
      requestType: PermissionType; 
      reason: string; 
      parent: Principal;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('📤 [useRequestPermission] Sending permission request:', {
        requestId,
        requestType,
        reason,
        parent: parent.toString(),
      });
      
      // Check if the method exists
      if (typeof (actor as any).requestPermission !== 'function') {
        console.error('❌ [useRequestPermission] Backend method requestPermission not found!');
        throw new Error('Backend method requestPermission is not available');
      }
      
      const result = await (actor as any).requestPermission(requestId, requestType, reason, parent);
      console.log('✅ [useRequestPermission] Request sent successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionRequests'] });
    },
    onError: (error) => {
      console.error('❌ [useRequestPermission] Failed to send request:', error);
    },
  });
}

export function useGetPendingPermissions() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['permissionRequests'],
    queryFn: async () => {
      if (!actor) return [];
      console.log('🔍 [useGetPendingPermissions] Fetching pending permissions...');
      
      // Check if the method exists
      if (typeof (actor as any).getPendingPermissions !== 'function') {
        console.warn('⚠️ [useGetPendingPermissions] Backend method getPendingPermissions not found');
        return [];
      }
      
      const requests = await (actor as any).getPendingPermissions();
      console.log('📦 [useGetPendingPermissions] Fetched requests:', requests);
      return requests;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useApprovePermission() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, approve }: { requestId: string; approve: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      console.log(`${approve ? '✅' : '❌'} [useApprovePermission] ${approve ? 'Approving' : 'Denying'} request:`, requestId);
      
      // Check if the method exists
      if (typeof (actor as any).approvePermission !== 'function') {
        console.error('❌ [useApprovePermission] Backend method approvePermission not found!');
        throw new Error('Backend method approvePermission is not available');
      }
      
      const result = await (actor as any).approvePermission(requestId, approve);
      console.log('✅ [useApprovePermission] Action completed successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionRequests'] });
    },
    onError: (error) => {
      console.error('❌ [useApprovePermission] Failed to process request:', error);
    },
  });
}

// Fight Counter Queries
export function useGetFightCounters() {
  const { actor, isFetching } = useActor();

  return useQuery<[bigint, bigint]>({
    queryKey: ['fightCounters'],
    queryFn: async () => {
      if (!actor) return [BigInt(0), BigInt(0)];
      return (actor as any).getFightCounters();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useUpdateFightsSolved() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (count: number) => {
      if (!actor) throw new Error('Actor not available');
      // Log the difference to update the counter
      return (actor as any).logFamilyFight(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fightCounters'] });
    },
  });
}

export function useUpdateFightsCreated() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (count: number) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).logFamilyFight(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fightCounters'] });
    },
  });
}

// AI Conflict Analysis
export function useAnalyzeConflicts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).analyzeConflicts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conflicts'] });
    },
  });
}

export function useGetConflicts() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['conflicts'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getConflicts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProvideAIGuidance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guidance: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('🤖 [useProvideAIGuidance] Logging AI guidance:', guidance);
      // This is a stub - backend doesn't have this method yet
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiGuidance'] });
    },
  });
}

// Updates (Family Feed)
export function useGetUpdates() {
  const { actor, isFetching } = useActor();

  return useQuery<Update[]>({
    queryKey: ['updates'],
    queryFn: async () => {
      if (!actor) return [];
      console.log('📰 [useGetUpdates] Fetching updates...');
      // Backend doesn't have this method yet, return empty array
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useCreateUpdate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('📝 [useCreateUpdate] Creating update:', text);
      // Backend doesn't have this method yet, stub implementation
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['updates'] });
    },
  });
}

// Messaging
export function useGetMessagesWithUser() {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      console.log('💬 [useGetMessagesWithUser] Fetching messages...');
      const messages = await actor.getMessageHistory();
      console.log('📦 [useGetMessagesWithUser] Messages fetched:', messages);
      return messages;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      receiver, 
      text, 
      messageType = 'text' as MessageType,
      groceryItems,
      socialMediaUrl,
    }: { 
      receiver: Principal; 
      text: string;
      messageType?: MessageType;
      groceryItems?: string[];
      socialMediaUrl?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('📤 [useSendMessage] Sending message:', { 
        receiver: receiver.toString(), 
        text,
        messageType,
        groceryItems,
        socialMediaUrl,
      });
      await actor.sendMessage(
        receiver, 
        text, 
        messageType,
        groceryItems || null,
        socialMediaUrl || null
      );
      console.log('✅ [useSendMessage] Message sent successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      console.error('❌ [useSendMessage] Failed to send message:', error);
    },
  });
}

// Location Sharing
export function useShareLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Location) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).shareLocation(location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetFamilyLocations() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getFamilyLocations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

// Media Gallery
export function useAddMedia() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, description }: { file: ExternalBlob; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addMedia(file, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

export function useGetMedia() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['media'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMedia();
    },
    enabled: !!actor && !isFetching,
  });
}

// Reminders
export function useAddReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, dueDate }: { text: string; dueDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).addReminder(text, dueDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useGetReminders() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getReminders();
    },
    enabled: !!actor && !isFetching,
  });
}

// Educational Features
export function useUploadQuestionPaper() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, file }: { title: string; file: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).uploadQuestionPaper(title, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useUploadAnswerScript() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file }: { file: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).uploadAnswerScript(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useGetEducationalData() {
  const { actor, isFetching } = useActor();

  return useQuery<EducationalData>({
    queryKey: ['educationalData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getEducationalData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetStudyTips() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['studyTips'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getStudyTips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAskDoubt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doubt: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).askDoubt(doubt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useGetResolvedProblemsCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['resolvedProblems'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return (actor as any).getResolvedProblemsCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAIReviews() {
  const { actor, isFetching } = useActor();

  return useQuery<[AIPerformanceReview[], ICTechnologyTip[]]>({
    queryKey: ['aiReviews'],
    queryFn: async () => {
      if (!actor) return [[], []];
      return (actor as any).getAIReviews();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetHappinessScore() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['happinessScore'],
    queryFn: async () => {
      if (!actor) return 0;
      return (actor as any).getHappinessScore();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}
