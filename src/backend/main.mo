import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type Role = {
    #parent;
    #child;
  };

  public type UserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    location : ?Location;
    role : ?Role;
    lastUpdate : Int;
  };

  public type Location = {
    latitude : Float;
    longitude : Float;
    timestamp : Int;
  };

  public type PermissionType = {
    #goOut;
    #playGames;
    #watchYouTube;
  };

  public type PermissionRequest = {
    id : Text;
    child : Principal;
    requestType : PermissionType;
    reason : Text;
    granted : Bool;
    timestamp : Int;
    parent : Principal;
  };

  public type Update = {
    author : Principal;
    text : Text;
    timestamp : Int;
  };

  public type Media = {
    author : Principal;
    file : Storage.ExternalBlob;
    timestamp : Int;
    description : Text;
  };

  public type Reminder = {
    creator : Principal;
    text : Text;
    dueDate : Int;
    timestamp : Int;
  };

  public type Message = {
    author : Principal;
    receiver : Principal;
    text : Text;
    timestamp : Int;
  };

  module Update {
    public func compareByNewestFirst(a : Update, b : Update) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  // New types for education features
  public type FileType = {
    #questionPaper;
    #answerScript;
  };

  public type DocumentType = {
    #questionPaper : QuestionPaperType;
    #answerScript;
  };

  public type QuestionPaperType = {
    #finalExam;
    #curriculumBased;
    #samplePaper;
    #prescribedTextbook;
    #memoryBasedFromPeerCommunication;
    #useClassroomNotesOrCorrespondence;
  };

  public type StudyMaterial = {
    #questionPaper : ?QuestionPaperType;
    #solutionGuide;
    #handWrittenConceptNote;
    #expertReview;
    #userReview;
    #doubtClearingDocument;
  };

  public type HappinessFactors = {
    mother : Text;
    father : Text;
    child : Text;
    relatives : Text;
    friendships : Text;
    familyAcademicsEnvironment : Text;
    mentors : Text;
  };

  public type StudyTip = {
    id : Text;
    tip : Text;
    timestamp : Int;
    createdByAI : Bool;
    asrCompatibilityScore : ?Nat;
  };

  public type ASRFilter = { // Adaptive Study Recommendation
    fromProfessionals : Bool;
    fromParentalCaregivers : Bool;
    fromPeers : Bool;
    preferredLanguage : Text;
    preferredFormat : Text;
    learningStyle : Text;
    contentSourceType : Text;
  };

  public type DocumentMetadata = {
    documentId : Text;
    owner : Principal;
    fileType : FileType;
    title : Text;
    author : Text;
    publisher : Text;
    responsiblePerson : ?Text;
    shortDescription : ?Text;
    documentType : DocumentType;
    audience : Audience;
    createdTimestamp : Int;
    lastModifiedTimestamp : Int;
    versionHistory : [VersionHistory];
    reviewComments : [ReviewComment];
    extractedQuestions : [Text];
    categorizedTopics : [Text];
    practiceResources : ?[Text];
    bottomLineSuggestions : ?[Text];
    additionalSupportContacts : [SupportContact];
    learningIntelligenceInsights : ?LearningIntelligence;
    cognitiveSkillsRating : ?CognitiveSkillRating;
    reviewStatus : ReviewStatus;
  };

  public type Audience = {
    studentLevel : { #primary; #secondary; #higherSecondary; #undergraduate; #postgraduate };
    region : Text;
    language : Text;
  };

  public type VersionHistory = {
    id : Text;
    changeDescription : Text;
    timestamp : Int;
    author : Text;
  };

  public type ReviewComment = {
    id : Text;
    reviewer : Text;
    commentText : Text;
    createdTimestamp : Int;
    lastModifiedTimestamp : Int;
    responses : [CommentResponse];
    attachments : ?[ReviewAttachment];
    rating : Nat;
    status : ReviewStatus;
    expertiseLevel : ExpertiseLevel;
    suggestedCorrections : ?[Text];
    clarificationRequests : ?[ClarificationRequest];
  };

  public type CommentResponse = {
    id : Text;
    responder : Text;
    responseText : Text;
    timestamp : Int;
    responseType : ResponseType;
    supportsReview : Bool;
    supportsCorrection : Bool;
  };

  public type ReviewAttachment = {
    id : Text;
    attachmentType : AttachmentType;
    file : Storage.ExternalBlob;
    description : ?Text;
    createdBy : Text;
    timestamp : Int;
  };

  public type ReviewStatus = { #inProgress; #completed; #needsRevision };

  public type ExpertiseLevel = {
    #reviewer : Text;
    #subjectExpert : Text;
    #educator;
    #pedagogicalExpert;
    #contentHandler;
    #student : Text;
  };

  public type AttachmentType = {
    #audio;
    #video;
    #document;
    #image;
    #solutionGuide;
    #correction;
    #clarificationRequest;
    #summary;
  };

  public type ResponseType = { #directAnswer; #followUpQuestion; #clarification };

  public type ClarificationRequest = {
    id : Text;
    requester : Text;
    requestText : Text;
    timestamp : Int;
    requestedTopic : Text;
    urgency : UrgencyLevel;
    additionalMaterials : ?[Storage.ExternalBlob];
    expectedResponseFormat : ?Text;
    relatedToQuestion : ?Text;
  };

  public type UrgencyLevel = {
    #lowPriority;
    #mediumPriority;
    #highPriority;
  };

  public type SupportContact = {
    name : Text;
    contactType : ContactType;
    contactDetails : Text;
    description : ?Text;
    region : ?Text;
    language : ?Text;
  };

  public type ContactType = { #phone; #email; #website; #messagingApp; #coach; #consultant };

  public type LearningIntelligence = {
    aiAnalysisLevel : AIAnalysisLevel;
    learningStyleRecommendation : ?Text;
    improvementSuggests : ?[Text];
    advancedRecommendations : ?[Text];
    prioritizationScoring : ?Nat;
    predictedOutcome : ?Text;
    adaptiveSchedule : ?Schedule;
    progressTracking : ?[ProgressUpdate];
  };

  public type CognitiveSkillRating = {
    problemSolving : Nat;
    criticalThinking : Nat;
    memoryRetention : Nat;
    organization : Nat;
    creativity : Nat;
  };

  public type AIAnalysisLevel = { #basic; #intermediate; #advanced };

  public type Schedule = {
    id : Text;
    startTime : Int;
    endTime : Int;
    description : ?Text;
    repeating : Bool;
    repeatInterval : ?ScheduleInterval;
  };

  public type ScheduleInterval = {
    #daily;
    #weekly;
    #monthly;
    #custom : Nat;
  };

  public type ProgressUpdate = {
    id : Text;
    progressDescription : Text;
    progressTimestamp : Int;
    progressScore : Nat;
  };

  public type EducationalData = {
    classroomCommunication : [Text];
    questionPapers : [QuestionPaper];
    answerScripts : [AnswerScript];
    insights : [Text];
    doubts : [Text];
    resolvedProblems : Nat;
    studyTips : [Text];
    academicReminders : [Text];
  };

  public type QuestionPaper = {
    id : Text;
    title : Text;
    uploadedBy : Principal;
    uploadTimestamp : Int;
    file : Storage.ExternalBlob;
  };

  public type AnswerScript = {
    id : Text;
    student : Principal;
    uploadTimestamp : Int;
    file : Storage.ExternalBlob;
  };

  public type Student = {
    id : Text;
    name : Text;
    performanceHistory : [PerformanceRecord];
  };

  public type PerformanceRecord = {
    timestamp : Int;
    score : Float;
    subject : Text;
  };

  public type CognitiveQuestionAnalysis = {
    questionId : Text;
    analyzedBy : Text;
    cognitiveSkillRatings : CognitiveSkillRatingDoc;
    psychologicalFactors : PsychologicalFactors;
    questionDifficulty : Nat;
    reviewComments : [ReviewComment];
    reportedByStudent : Bool;
    reportedByParent : Bool;
    moderatedByExpert : Bool;
    moderationComments : [StringFeedback];
  };

  public type CognitiveSkillRatingDoc = {
    problemSolving : Nat;
    criticalThinking : Nat;
    memoryRetention : Nat;
    organization : Nat;
    creativity : Nat;
  };

  public type PsychologicalFactors = {
    focusedAttention : Nat;
    emotionalStability : Nat;
    stressLevel : Nat;
    resilience : Nat;
    persistence : Nat;
    enthusiasm : Nat;
  };

  public type StringFeedback = {
    sender : Text;
    feedback : Text;
    timestamp : Int;
    reviewStatus : ReviewStatus;
  };

  public type ParentFeedback = {
    parentId : Text;
    feedbackText : Text;
    feedbackTimestamp : Int;
    feedbackPurpose : Text;
  };

  public type ProblemRemedy = {
    description : Text;
    remedyType : Text;
  };

  public type AIPerformanceReview = {
    analysis : Text;
    recommendations : [ProblemRemedy];
    aiAnalysisLevel : { #basic; #intermediate; #advanced };
    resourceLinks : [Text];
  };

  public type ICTechnologyTip = {
    id : Text;
    tipText : Text;
    relevantTechnology : Text;
    timestamp : Int;
  };

  public type PsychologicalImprovement = {
    areaOfImprovement : Text;
    suggestedExercises : [Exercise];
    recommendedSupport : [SupportResource];
    sciencePsychologyReference : Text;
  };

  public type Exercise = {
    exerciseName : Text;
    exerciseDescription : Text;
  };

  public type SupportResource = {
    resourceName : Text;
    resourceType : Text;
    resourceUrl : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let updates = List.empty<Update>();
  let mediaPosts = List.empty<Media>();
  let reminders = List.empty<Reminder>();
  let messages = List.empty<Message>();
  let permissionRequests = Map.empty<Text, PermissionRequest>();

  let educationalDataMap = Map.empty<Principal, EducationalData>();
  let documentMetadataMap = Map.empty<Text, DocumentMetadata>();
  let documentReviewsMap = Map.empty<Text, ReviewComment>();
  let parentFeedbackMap = Map.empty<Text, ParentFeedback>();
  let aiPerformanceReviewsMap = Map.empty<Text, AIPerformanceReview>();
  let icTechnologyTipsMap = Map.empty<Text, ICTechnologyTip>();

  var fightsSolved = 0 : Nat;
  var fightsCreated = 0 : Nat;

  private func isParent(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (null) { false };
          case (?(#parent)) { true };
          case (?(#child)) { false };
        };
      };
    };
  };

  private func isChild(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (null) { false };
          case (?(#parent)) { false };
          case (?(#child)) { true };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createProfile(displayName : Text, role : Role) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    let educationalData : EducationalData = {
      classroomCommunication = [];
      questionPapers = [];
      answerScripts = [];
      insights = [];
      doubts = [];
      resolvedProblems = 0;
      studyTips = [];
      academicReminders = [];
    };

    let profile : UserProfile = {
      displayName;
      avatar = null;
      location = null;
      lastUpdate = Time.now();
      role = ?role;
    };
    educationalDataMap.add(caller, educationalData);
    userProfiles.add(caller, profile);
  };
};
