import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration"; // Import Migration module

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type Role = {
    #parent;
    #child;
  };

  public type FamilyMember = {
    name : Text;
    principal : Principal;
  };

  public type ExpenseCategory = {
    #fees;
    #groceries;
    #other;
  };

  public type ExpenseEntry = {
    category : ExpenseCategory;
    amount : Nat;
    timestamp : Int;
  };

  public type Expenses = {
    entries : [ExpenseEntry];
    totalFees : Nat;
    totalGroceries : Nat;
    totalOther : Nat;
  };

  public type UserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    location : ?Location;
    role : ?Role;
    lastUpdate : Int;
    parents : [FamilyMember]; // Up to 2 parents
    children : [FamilyMember]; // Dynamic list of children
    totalExpenses : Expenses;
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

  public type MessageType = {
    #text;
    #groceryList;
    #socialMediaLink;
  };

  public type Message = {
    author : Principal;
    receiver : Principal;
    text : Text;
    messageType : MessageType;
    groceryItems : ?[Text];
    socialMediaUrl : ?Text;
    timestamp : Int;
  };

  module Update {
    public func compareByNewestFirst(a : Update, b : Update) : Nat {
      if (a.timestamp > b.timestamp) { 1 } else { 0 };
    };
  };

  public type FileType = {
    #questionPaper;
    #answerScript;
  };

  public type DocumentType = {
    #questionPaper : ?QuestionPaperType;
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
    #questionPaper : QuestionPaperType;
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

  public type FamilyInvitation = {
    childPrincipal : Principal;
    parentPrincipal : Principal;
    isValid : Bool;
    created : Int;
    expires : Int;
    token : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let updates = List.empty<Update>();
  let mediaPosts = List.empty<Media>();
  let reminders = List.empty<Reminder>();
  let messages = List.empty<Message>();
  let permissionRequests = Map.empty<Text, PermissionRequest>();

  let invitationTokens = Map.empty<Text, FamilyInvitation>();
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
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
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

  public shared ({ caller }) func updateUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    // If current profile exists, check for role changes
    let currentProfile = userProfiles.get(caller);

    // Validate role changes: allow parent->child, block child->parent
    switch (currentProfile) {
      case (?existing) {
        switch (existing.role, profile.role) {
          // Current role is child, new role is parent -> BLOCK (privilege escalation)
          case (?(#child), ?(#parent)) {
            Runtime.trap("Unauthorized: Cannot change role from child to parent");
          };
          // Current role is parent, new role is child -> ALLOW (downgrade)
          case (?(#parent), ?(#child)) {
            // This is allowed
          };
          // All other combinations are allowed (same role, null, etc.)
          case (_, _) {
            // Allowed
          };
        };
      };
      // No existing profile, any role is allowed for first-time setup
      case (null) {};
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
      parents = [];
      children = [];
      totalExpenses = {
        entries = [];
        totalFees = 0;
        totalGroceries = 0;
        totalOther = 0;
      };
    };
    educationalDataMap.add(caller, educationalData);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addParent(parentName : Text, parentPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add parents");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    if (currentProfile.parents.size() >= 2) {
      Runtime.trap("Cannot add more than 2 parents");
    };

    // Verify that the parent principal exists and has a profile
    switch (userProfiles.get(parentPrincipal)) {
      case (null) { Runtime.trap("Parent profile does not exist") };
      case (?_) { /* Parent exists, continue */ };
    };

    let newParent : FamilyMember = {
      name = parentName;
      principal = parentPrincipal;
    };

    let updatedParents = currentProfile.parents.concat([newParent]);
    let updatedProfile = { currentProfile with parents = updatedParents };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func removeParent(parentPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove parents");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let filteredParents = currentProfile.parents.filter(func(parent) { parent.principal != parentPrincipal });
    let updatedProfile = { currentProfile with parents = filteredParents };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func addChild(childName : Text, childPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add children");
    };

    // Only parents can add children
    if (not isParent(caller)) {
      Runtime.trap("Unauthorized: Only parents can add children");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    // Verify that the child principal exists and has a profile
    switch (userProfiles.get(childPrincipal)) {
      case (null) { Runtime.trap("Child profile does not exist") };
      case (?_) { /* Child exists, continue */ };
    };

    let newChild : FamilyMember = {
      name = childName;
      principal = childPrincipal;
    };

    let updatedChildren = currentProfile.children.concat([newChild]);
    let updatedProfile = { currentProfile with children = updatedChildren };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func removeChild(childPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove children");
    };

    // Only parents can remove children
    if (not isParent(caller)) {
      Runtime.trap("Unauthorized: Only parents can remove children");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let filteredChildren = currentProfile.children.filter(func(child) { child.principal != childPrincipal });
    let updatedProfile = { currentProfile with children = filteredChildren };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func addExpense(category : ExpenseCategory, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expenses");
    };

    // Only parents can add expenses
    if (not isParent(caller)) {
      Runtime.trap("Unauthorized: Only parents can add expenses");
    };

    let expenseEntry : ExpenseEntry = {
      category;
      amount;
      timestamp = Time.now();
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?currentProfile) {
        let updatedEntries = currentProfile.totalExpenses.entries.concat([expenseEntry]);
        var newTotalFees = currentProfile.totalExpenses.totalFees;
        var newTotalGroceries = currentProfile.totalExpenses.totalGroceries;
        var newTotalOther = currentProfile.totalExpenses.totalOther;

        switch (category) {
          case (#fees) { newTotalFees += amount };
          case (#groceries) { newTotalGroceries += amount };
          case (#other) { newTotalOther += amount };
        };

        let updatedExpenses : Expenses = {
          entries = updatedEntries;
          totalFees = newTotalFees;
          totalGroceries = newTotalGroceries;
          totalOther = newTotalOther;
        };

        let updatedProfile = { currentProfile with totalExpenses = updatedExpenses };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getExpenseSummary() : async Expenses {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expense summaries");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile.totalExpenses };
    };
  };

  public shared ({ caller }) func createFamilyInvitationToken(child : Principal, validationTimeHours : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create invitations");
    };

    if (not isParent(caller)) {
      Runtime.trap("Unauthorized: Only parents can create invitations");
    };

    if (child == caller) {
      Runtime.trap("Cannot invite yourself");
    };

    let token = child.toText().concat(caller.toText()).concat(Time.now().toText());
    let created = Time.now();
    let validUntil = created + (Int.fromNat(validationTimeHours) * 3600 * 1000000);

    let invitation = {
      childPrincipal = child;
      parentPrincipal = caller;
      isValid = true;
      created;
      expires = validUntil;
      token;
    };

    invitationTokens.add(token, invitation);
    token;
  };

  public shared ({ caller }) func validateFamilyInvitationToken(token : Text, child : Principal) : async Principal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can validate invitations");
    };

    if (not isChild(caller)) {
      Runtime.trap("Unauthorized: Only children can validate invitations");
    };

    if (child != caller) {
      Runtime.trap("Unauthorized: Can only validate invitations for yourself");
    };

    let invitation = switch (invitationTokens.get(token)) {
      case (null) { Runtime.trap("Invitation not found or expired") };
      case (?invitation) { invitation };
    };

    if (not invitation.isValid) {
      Runtime.trap("Invitation already used or invalid");
    };

    if (invitation.childPrincipal != child) {
      Runtime.trap("Invitation token does not belong to this child");
    };

    if (Time.now() > invitation.expires) {
      invitationTokens.add(token, { invitation with isValid = false });
      Runtime.trap("Invitation token expired");
    };

    invitationTokens.add(token, { invitation with isValid = false });
    invitation.parentPrincipal;
  };

  public query ({ caller }) func getActiveFamilyInvitations() : async [FamilyInvitation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get active invitations");
    };

    let invitations = invitationTokens.toArray().map(func((_, invitation)) { invitation });
    
    // Filter to only invitations relevant to the caller (either as parent or child)
    let relevantInvitations = invitations.filter(func(invitation) {
      (invitation.parentPrincipal == caller or invitation.childPrincipal == caller) and
      Time.now() <= invitation.expires and 
      invitation.isValid
    });
    
    relevantInvitations;
  };

  // Backend message handler for new data structure
  public shared ({ caller }) func sendMessage(
    receiver : Principal,
    text : Text,
    messageType : MessageType,
    groceryItems : ?[Text],
    socialMediaUrl : ?Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    // Validate that receiver exists
    switch (userProfiles.get(receiver)) {
      case (null) { Runtime.trap("Receiver profile does not exist") };
      case (?_) { /* Receiver exists, continue */ };
    };

    switch (messageType) {
      case (#groceryList) {
        switch (groceryItems) {
          case (null) { Runtime.trap("Grocery items must be provided for grocery list messages") };
          case (?items) {
            if (items.size() == 0) {
              Runtime.trap("Grocery items cannot be empty for grocery list messages");
            };
          };
        };
      };
      case (#socialMediaLink) {
        switch (socialMediaUrl) {
          case (null) { Runtime.trap("Social media URL must be provided for social media links") };
          case (?url) {
            if (url.size() < 5) {
              Runtime.trap("Invalid social media URL");
            };
          };
        };
      };
      case (#text) {};
    };

    let message : Message = {
      author = caller;
      receiver;
      text;
      messageType;
      groceryItems;
      socialMediaUrl;
      timestamp = Time.now();
    };

    messages.add(message);
  };

  public query ({ caller }) func getMessageHistory() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get message history");
    };

    // Filter messages to only those where caller is author or receiver
    let allMessages = messages.toArray();
    let userMessages = allMessages.filter(func(msg) {
      msg.author == caller or msg.receiver == caller
    });
    
    userMessages;
  };
};
