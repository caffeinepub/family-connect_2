import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  UserProfile, 
  Role,
} from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob } from '../backend';

// Define and EXPORT types that are not exported from backend
export type Message = {
  author: Principal;
  receiver: Principal;
  text: string;
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

// AI Guidance
export function useProvideAIGuidance() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (analysis: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).provideAIGuidance(analysis);
    },
  });
}

// Updates Queries - Backend doesn't have these methods
export function useGetUpdates() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['updates'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have getUpdates
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useCreateUpdate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have createUpdate
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['updates'] });
    },
  });
}

// Media Queries - Backend doesn't have these methods
export function useGetMedia() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['media'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have getMedia
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useAddMedia() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, description }: { file: ExternalBlob; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have addMedia
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}

// Reminders Queries - Backend doesn't have these methods
export function useGetReminders() {
  const { actor, isFetching } = useActor();

  return useQuery<any[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have getReminders
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useAddReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, dueDate }: { text: string; dueDate: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have addReminder
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

// Messages Queries - Backend doesn't have these methods
export function useGetMessages() {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have getMessages
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useGetMessagesWithUser() {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have getMessages
      return [];
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, text }: { receiver: Principal; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have sendMessage
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

// Location Sharing
export function useShareLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have shareLocation
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
    },
  });
}

// Educational Data Queries - Backend doesn't have these methods
export function useGetEducationalData() {
  const { actor, isFetching } = useActor();

  return useQuery<EducationalData | null>({
    queryKey: ['educationalData'],
    queryFn: async () => {
      if (!actor) return null;
      // Backend doesn't have getEducationalData
      return null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadQuestionPaper() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, file }: { title: string; file: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have uploadQuestionPaper
      return Promise.resolve();
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
      // Backend doesn't have uploadAnswerScript
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useGetAIAnalysis() {
  const { actor, isFetching } = useActor();

  return useQuery<AIPerformanceReview | null>({
    queryKey: ['aiAnalysis'],
    queryFn: async () => {
      if (!actor) return null;
      // Backend doesn't have getAIAnalysis
      return null;
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
      // Backend doesn't have getStudyTips
      return [];
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
      // Backend doesn't have getAIReviews
      return [[], []];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitDoubt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doubt: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have submitDoubt
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useAskDoubt() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doubt: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have askDoubt - return mock response
      return `Thank you for your inquiry. I shall endeavor to provide clarification on the matter you have raised: "${doubt}". This is a simulated response as the backend method is not yet implemented.`;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useMarkProblemResolved() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have markProblemResolved
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['educationalData'] });
    },
  });
}

export function useGetICTechnologyTips() {
  const { actor, isFetching } = useActor();

  return useQuery<ICTechnologyTip[]>({
    queryKey: ['icTechnologyTips'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend doesn't have getICTechnologyTips
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Happiness Score Query - Backend doesn't have this method
export function useGetHappinessScore() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['happinessScore'],
    queryFn: async () => {
      if (!actor) return 75;
      // Backend doesn't have getHappinessScore
      return 75;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

// Alias for HappinessMeter component
export function useGetHappinessMeter() {
  return useGetHappinessScore();
}

// Resolved Problems Count
export function useGetResolvedProblemsCount() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['resolvedProblemsCount'],
    queryFn: async () => {
      if (!actor) return 0;
      // Backend doesn't have this method
      return 0;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}
