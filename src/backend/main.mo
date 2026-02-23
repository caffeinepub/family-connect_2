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
import Iter "mo:core/Iter";



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
    parents : [FamilyMember];
    children : [FamilyMember];
    totalExpenses : Expenses;
    aiRemedyEnabled : Bool;
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
    parent : FamilyMember;
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

  public type ChatType = {
    #privateChat;
    #group;
  };

  public type Message = {
    author : Principal;
    text : Text;
    messageType : MessageType;
    groceryItems : ?[Text];
    socialMediaUrl : ?Text;
    timestamp : Int;
    chatType : ChatType;
    recipientId : ?Principal;
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

  public type ASRFilter = {
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

  var globalFightsSolved = 0 : Nat;
  var globalFightsCreated = 0 : Nat;

  func isParent(caller : Principal) : Bool {
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

  func isChild(caller : Principal) : Bool {
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

  func getFamilyMembers(caller : Principal) : [Principal] {
    switch (userProfiles.get(caller)) {
      case (null) { [] };
      case (?profile) {
        let parentPrincipals = profile.parents.map(func(p : FamilyMember) : Principal { p.principal });
        let childPrincipals = profile.children.map(func(c : FamilyMember) : Principal { c.principal });
        parentPrincipals.concat(childPrincipals);
      };
    };
  };

  func areFamilyMembers(user1 : Principal, user2 : Principal) : Bool {
    if (user1 == user2) {
      return true;
    };

    let user1Family = getFamilyMembers(user1);
    let user2Family = getFamilyMembers(user2);

    for (member in user1Family.vals()) {
      if (member == user2) {
        return true;
      };
    };

    for (member in user2Family.vals()) {
      if (member == user1) {
        return true;
      };
    };

    false;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
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

    let currentProfile = userProfiles.get(caller);

    switch (currentProfile) {
      case (?existing) {
        switch (existing.role, profile.role) {
          case (?(#child), ?(#parent)) {
            Runtime.trap("Unauthorized: Cannot change role from child to parent");
          };
          case (?(#parent), ?(#child)) {
            Runtime.trap("Unauthorized: Cannot change role from parent to child");
          };
          case (_, _) {};
        };
      };
      case (null) {};
    };

    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createProfile(displayName : Text, role : Role) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    switch (userProfiles.get(caller)) {
      case (?_) {
        Runtime.trap("Profile already exists for this user");
      };
      case (null) {};
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
      aiRemedyEnabled = true;
    };
    educationalDataMap.add(caller, educationalData);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addParent(parentName : Text, parentPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add parents");
    };

    if (not isChild(caller)) {
      Runtime.trap("Unauthorized: Only children can add parents");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    if (currentProfile.parents.size() >= 2) {
      Runtime.trap("Cannot add more than 2 parents");
    };

    let parentProfile = switch (userProfiles.get(parentPrincipal)) {
      case (null) { Runtime.trap("Parent profile does not exist") };
      case (?profile) { profile };
    };

    switch (parentProfile.role) {
      case (?(#parent)) {};
      case (_) { Runtime.trap("Target user is not a parent") };
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

    if (not isChild(caller)) {
      Runtime.trap("Unauthorized: Only children can remove parents");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let filteredParents = currentProfile.parents.filter(func(parent) { parent.principal != parentPrincipal });
    
    if (filteredParents.size() == currentProfile.parents.size()) {
      Runtime.trap("Parent not found in your family");
    };

    let updatedProfile = { currentProfile with parents = filteredParents };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func addChild(childName : Text, childPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add children");
    };

    if (not isParent(caller)) {
      Runtime.trap("Unauthorized: Only parents can add children");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let childProfile = switch (userProfiles.get(childPrincipal)) {
      case (null) { Runtime.trap("Child profile does not exist") };
      case (?profile) { profile };
    };

    switch (childProfile.role) {
      case (?(#child)) {};
      case (_) { Runtime.trap("Target user is not a child") };
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

    if (not isParent(caller)) {
      Runtime.trap("Unauthorized: Only parents can remove children");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let filteredChildren = currentProfile.children.filter(func(child) { child.principal != childPrincipal });
    
    if (filteredChildren.size() == currentProfile.children.size()) {
      Runtime.trap("Child not found in your family");
    };

    let updatedProfile = { currentProfile with children = filteredChildren };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func addExpense(category : ExpenseCategory, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expenses");
    };

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

    if (not isParent(caller)) {
      Runtime.trap("Unauthorized: Only parents can view expense summaries");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile.totalExpenses };
    };
  };

  public shared ({ caller }) func createPermissionRequest(
    parentPrincipal : Principal,
    requestType : PermissionType,
    reason : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create permission requests");
    };

    if (not isChild(caller)) {
      Runtime.trap("Unauthorized: Only children can create permission requests");
    };

    if (not areFamilyMembers(caller, parentPrincipal)) {
      Runtime.trap("Unauthorized: Can only request permission from your parents");
    };

    let parentProfile = switch (userProfiles.get(parentPrincipal)) {
      case (null) { Runtime.trap("Parent profile not found") };
      case (?profile) { profile };
    };

    if (not isParent(parentPrincipal)) {
      Runtime.trap("Target user is not a parent");
    };

    let requestId = caller.toText().concat(parentPrincipal.toText()).concat(Time.now().toText());

    let parentMember : FamilyMember = {
      name = parentProfile.displayName;
      principal = parentPrincipal;
    };

    let request : PermissionRequest = {
      id = requestId;
      child = caller;
      requestType;
      reason;
      granted = false;
      timestamp = Time.now();
      parent = parentMember;
    };

    permissionRequests.add(requestId, request);
    requestId;
  };

  public query ({ caller }) func getPermissionRequests() : async [PermissionRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view permission requests");
    };

    let allRequests = permissionRequests.toArray().map(func((_, request)) { request });

    let userRequests = allRequests.filter(func(request) {
      request.child == caller or request.parent.principal == caller
    });

    userRequests;
  };

  public shared ({ caller }) func respondToPermissionRequest(requestId : Text, granted : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can respond to permission requests");
    };

    if (not isParent(caller)) {
      Runtime.trap("Unauthorized: Only parents can respond to permission requests");
    };

    let request = switch (permissionRequests.get(requestId)) {
      case (null) { Runtime.trap("Permission request not found") };
      case (?req) { req };
    };

    if (request.parent.principal != caller) {
      Runtime.trap("Unauthorized: Can only respond to requests directed to you");
    };

    let updatedRequest = { request with granted = granted };
    permissionRequests.add(requestId, updatedRequest);
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

    let childProfile = switch (userProfiles.get(child)) {
      case (null) { Runtime.trap("Child profile does not exist") };
      case (?profile) { profile };
    };

    switch (childProfile.role) {
      case (?(#child)) {};
      case (_) { Runtime.trap("Target user is not a child") };
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

    if (child != caller) {
      Runtime.trap("Unauthorized: Can only validate invitations for yourself");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    switch (callerProfile.role) {
      case (?(#child)) {};
      case (_) { Runtime.trap("Unauthorized: Only children can validate invitations") };
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

    let relevantInvitations = invitations.filter(func(invitation) {
      (invitation.parentPrincipal == caller or invitation.childPrincipal == caller) and
      Time.now() <= invitation.expires and
      invitation.isValid
    });

    relevantInvitations;
  };

  public shared ({ caller }) func sendMessage(
    text : Text,
    messageType : MessageType,
    groceryItems : ?[Text],
    socialMediaUrl : ?Text,
    chatType : ChatType,
    recipientId : ?Principal,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (chatType == #privateChat and recipientId == null) {
      Runtime.trap("Recipient ID must be provided for private messages");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let familyMembers = getFamilyMembers(caller);
    if (familyMembers.size() == 0) {
      Runtime.trap("Unauthorized: You must be part of a family to send messages");
    };

    switch (chatType) {
      case (#privateChat) {
        switch (recipientId) {
          case (null) { Runtime.trap("Recipient ID must be provided for private messages") };
          case (?recipient) {
            if (not areFamilyMembers(caller, recipient)) {
              Runtime.trap("Unauthorized: Can only send private messages to family members");
            };
          };
        };
      };
      case (#group) {};
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
      text;
      messageType;
      groceryItems;
      socialMediaUrl;
      timestamp = Time.now();
      chatType;
      recipientId;
    };

    messages.add(message);
  };

  public query ({ caller }) func getMessageHistory() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get message history");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let familyMembers = getFamilyMembers(caller);

    let allMessages = messages.toArray();

    let userMessages = allMessages.filter(func(msg) {
      if (msg.chatType == #group) {
        if (msg.author == caller) {
          return true;
        };
        return areFamilyMembers(caller, msg.author);
      };

      if (msg.chatType == #privateChat) {
        switch (msg.recipientId) {
          case (null) { false };
          case (?recipient) {
            let isParticipant = (msg.author == caller or recipient == caller);
            let areFamilyMembersCheck = areFamilyMembers(msg.author, recipient);
            isParticipant and areFamilyMembersCheck;
          };
        };
      } else {
        false;
      };
    });

    userMessages;
  };

  public query ({ caller }) func getFightsSolved() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access this feature");
    };
    globalFightsSolved;
  };

  public query ({ caller }) func getFightsCreated() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access this feature");
    };
    globalFightsCreated;
  };

  public shared ({ caller }) func setAIRemedyEnabled(enabled : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access this feature");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let updatedProfile = { currentProfile with aiRemedyEnabled = enabled };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getAIRemedyEnabled() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access this feature");
    };

    let currentProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    currentProfile.aiRemedyEnabled;
  };

  public shared ({ caller }) func incrementFightsSolved() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can increment fights solved");
    };
    globalFightsSolved += 1;
  };

  public shared ({ caller }) func incrementFightsCreated() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can increment fights created");
    };
    globalFightsCreated += 1;
  };
};
