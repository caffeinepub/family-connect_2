import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, {
      displayName : Text;
      avatar : ?Storage.ExternalBlob;
      location : ?{
        latitude : Float;
        longitude : Float;
        timestamp : Int;
      };
      role : ?{
        #parent;
        #child;
      };
      lastUpdate : Int;
      parents : [{
        name : Text;
        principal : Principal;
      }];
      children : [{
        name : Text;
        principal : Principal;
      }];
      totalExpenses : {
        entries : [{
          category : {
            #fees;
            #groceries;
            #other;
          };
          amount : Nat;
          timestamp : Int;
        }];
        totalFees : Nat;
        totalGroceries : Nat;
        totalOther : Nat;
      };
    }>;
    updates : List.List<{
      author : Principal;
      text : Text;
      timestamp : Int;
    }>;
    mediaPosts : List.List<{
      author : Principal;
      file : Storage.ExternalBlob;
      timestamp : Int;
      description : Text;
    }>;
    reminders : List.List<{
      creator : Principal;
      text : Text;
      dueDate : Int;
      timestamp : Int;
    }>;
    messages : List.List<{
      author : Principal;
      text : Text;
      messageType : { #text; #groceryList; #socialMediaLink };
      groceryItems : ?[Text];
      socialMediaUrl : ?Text;
      timestamp : Int;
      chatType : { #privateChat; #group };
      recipientId : ?Principal;
    }>;
    permissionRequests : Map.Map<Text, {
      id : Text;
      child : Principal;
      requestType : { #goOut; #playGames; #watchYouTube };
      reason : Text;
      granted : Bool;
      timestamp : Int;
      parent : { name : Text; principal : Principal };
    }>;
    invitationTokens : Map.Map<Text, {
      childPrincipal : Principal;
      parentPrincipal : Principal;
      isValid : Bool;
      created : Int;
      expires : Int;
      token : Text;
    }>;
    educationalDataMap : Map.Map<Principal, {
      classroomCommunication : [Text];
      questionPapers : [{
        id : Text;
        title : Text;
        uploadedBy : Principal;
        uploadTimestamp : Int;
        file : Storage.ExternalBlob;
      }];
      answerScripts : [{
        id : Text;
        student : Principal;
        uploadTimestamp : Int;
        file : Storage.ExternalBlob;
      }];
      insights : [Text];
      doubts : [Text];
      resolvedProblems : Nat;
      studyTips : [Text];
      academicReminders : [Text];
    }>;
    documentMetadataMap : Map.Map<Text, {
      documentId : Text;
      owner : Principal;
      fileType : { #questionPaper; #answerScript };
      title : Text;
      author : Text;
      publisher : Text;
      responsiblePerson : ?Text;
      shortDescription : ?Text;
      documentType : {
        #questionPaper : ?{
          #finalExam;
          #curriculumBased;
          #samplePaper;
          #prescribedTextbook;
          #memoryBasedFromPeerCommunication;
          #useClassroomNotesOrCorrespondence;
        };
        #answerScript;
      };
      audience : {
        studentLevel : { #primary; #secondary; #higherSecondary; #undergraduate; #postgraduate };
        region : Text;
        language : Text;
      };
      createdTimestamp : Int;
      lastModifiedTimestamp : Int;
      versionHistory : [{
        id : Text;
        changeDescription : Text;
        timestamp : Int;
        author : Text;
      }];
      reviewComments : [{
        id : Text;
        reviewer : Text;
        commentText : Text;
        createdTimestamp : Int;
        lastModifiedTimestamp : Int;
        responses : [{
          id : Text;
          responder : Text;
          responseText : Text;
          timestamp : Int;
          responseType : { #directAnswer; #followUpQuestion; #clarification };
          supportsReview : Bool;
          supportsCorrection : Bool;
        }];
        attachments : ?[{
          id : Text;
          attachmentType : {
            #audio;
            #video;
            #document;
            #image;
            #solutionGuide;
            #correction;
            #clarificationRequest;
            #summary;
          };
          file : Storage.ExternalBlob;
          description : ?Text;
          createdBy : Text;
          timestamp : Int;
        }];
        rating : Nat;
        status : { #inProgress; #completed; #needsRevision };
        expertiseLevel : {
          #reviewer : Text;
          #subjectExpert : Text;
          #educator;
          #pedagogicalExpert;
          #contentHandler;
          #student : Text;
        };
        suggestedCorrections : ?[Text];
        clarificationRequests : ?[{
          id : Text;
          requester : Text;
          requestText : Text;
          timestamp : Int;
          requestedTopic : Text;
          urgency : { #lowPriority; #mediumPriority; #highPriority };
          additionalMaterials : ?[Storage.ExternalBlob];
          expectedResponseFormat : ?Text;
          relatedToQuestion : ?Text;
        }];
      }];
      extractedQuestions : [Text];
      categorizedTopics : [Text];
      practiceResources : ?[Text];
      bottomLineSuggestions : ?[Text];
      additionalSupportContacts : [{
        name : Text;
        contactType : { #phone; #email; #website; #messagingApp; #coach; #consultant };
        contactDetails : Text;
        description : ?Text;
        region : ?Text;
        language : ?Text;
      }];
      learningIntelligenceInsights : ?{
        aiAnalysisLevel : { #basic; #intermediate; #advanced };
        learningStyleRecommendation : ?Text;
        improvementSuggests : ?[Text];
        advancedRecommendations : ?[Text];
        prioritizationScoring : ?Nat;
        predictedOutcome : ?Text;
        adaptiveSchedule : ?{
          id : Text;
          startTime : Int;
          endTime : Int;
          description : ?Text;
          repeating : Bool;
          repeatInterval : ?{
            #daily;
            #weekly;
            #monthly;
            #custom : Nat;
          };
        };
        progressTracking : ?[{
          id : Text;
          progressDescription : Text;
          progressTimestamp : Int;
          progressScore : Nat;
        }];
      };
      cognitiveSkillsRating : ?{
        problemSolving : Nat;
        criticalThinking : Nat;
        memoryRetention : Nat;
        organization : Nat;
        creativity : Nat;
      };
      reviewStatus : { #inProgress; #completed; #needsRevision };
    }>;
    documentReviewsMap : Map.Map<Text, {
      id : Text;
      reviewer : Text;
      commentText : Text;
      createdTimestamp : Int;
      lastModifiedTimestamp : Int;
      responses : [{
        id : Text;
        responder : Text;
        responseText : Text;
        timestamp : Int;
        responseType : { #directAnswer; #followUpQuestion; #clarification };
        supportsReview : Bool;
        supportsCorrection : Bool;
      }];
      attachments : ?[{
        id : Text;
        attachmentType : {
          #audio;
          #video;
          #document;
          #image;
          #solutionGuide;
          #correction;
          #clarificationRequest;
          #summary;
        };
        file : Storage.ExternalBlob;
        description : ?Text;
        createdBy : Text;
        timestamp : Int;
      }];
      rating : Nat;
      status : { #inProgress; #completed; #needsRevision };
      expertiseLevel : {
        #reviewer : Text;
        #subjectExpert : Text;
        #educator;
        #pedagogicalExpert;
        #contentHandler;
        #student : Text;
      };
      suggestedCorrections : ?[Text];
      clarificationRequests : ?[{
        id : Text;
        requester : Text;
        requestText : Text;
        timestamp : Int;
        requestedTopic : Text;
        urgency : { #lowPriority; #mediumPriority; #highPriority };
        additionalMaterials : ?[Storage.ExternalBlob];
        expectedResponseFormat : ?Text;
        relatedToQuestion : ?Text;
      }];
    }>;
    parentFeedbackMap : Map.Map<Text, {
      parentId : Text;
      feedbackText : Text;
      feedbackTimestamp : Int;
      feedbackPurpose : Text;
    }>;
    aiPerformanceReviewsMap : Map.Map<Text, {
      analysis : Text;
      recommendations : [{
        description : Text;
        remedyType : Text;
      }];
      aiAnalysisLevel : { #basic; #intermediate; #advanced };
      resourceLinks : [Text];
    }>;
    icTechnologyTipsMap : Map.Map<Text, {
      id : Text;
      tipText : Text;
      relevantTechnology : Text;
      timestamp : Int;
    }>;
    fightsSolved : Nat;
    fightsCreated : Nat;
  };

  public func run(old : OldActor) : {
    userProfiles : Map.Map<Principal, {
      displayName : Text;
      avatar : ?Storage.ExternalBlob;
      location : ?{
        latitude : Float;
        longitude : Float;
        timestamp : Int;
      };
      role : ?{
        #parent;
        #child;
      };
      lastUpdate : Int;
      parents : [{
        name : Text;
        principal : Principal;
      }];
      children : [{
        name : Text;
        principal : Principal;
      }];
      totalExpenses : {
        entries : [{
          category : {
            #fees;
            #groceries;
            #other;
          };
          amount : Nat;
          timestamp : Int;
        }];
        totalFees : Nat;
        totalGroceries : Nat;
        totalOther : Nat;
      };
      aiRemedyEnabled : Bool;
    }>;
    updates : List.List<{
      author : Principal;
      text : Text;
      timestamp : Int;
    }>;
    mediaPosts : List.List<{
      author : Principal;
      file : Storage.ExternalBlob;
      timestamp : Int;
      description : Text;
    }>;
    reminders : List.List<{
      creator : Principal;
      text : Text;
      dueDate : Int;
      timestamp : Int;
    }>;
    messages : List.List<{
      author : Principal;
      text : Text;
      messageType : { #text; #groceryList; #socialMediaLink };
      groceryItems : ?[Text];
      socialMediaUrl : ?Text;
      timestamp : Int;
      chatType : { #privateChat; #group };
      recipientId : ?Principal;
    }>;
    permissionRequests : Map.Map<Text, {
      id : Text;
      child : Principal;
      requestType : { #goOut; #playGames; #watchYouTube };
      reason : Text;
      granted : Bool;
      timestamp : Int;
      parent : { name : Text; principal : Principal };
    }>;
    invitationTokens : Map.Map<Text, {
      childPrincipal : Principal;
      parentPrincipal : Principal;
      isValid : Bool;
      created : Int;
      expires : Int;
      token : Text;
    }>;
    educationalDataMap : Map.Map<Principal, {
      classroomCommunication : [Text];
      questionPapers : [{
        id : Text;
        title : Text;
        uploadedBy : Principal;
        uploadTimestamp : Int;
        file : Storage.ExternalBlob;
      }];
      answerScripts : [{
        id : Text;
        student : Principal;
        uploadTimestamp : Int;
        file : Storage.ExternalBlob;
      }];
      insights : [Text];
      doubts : [Text];
      resolvedProblems : Nat;
      studyTips : [Text];
      academicReminders : [Text];
    }>;
    documentMetadataMap : Map.Map<Text, {
      documentId : Text;
      owner : Principal;
      fileType : { #questionPaper; #answerScript };
      title : Text;
      author : Text;
      publisher : Text;
      responsiblePerson : ?Text;
      shortDescription : ?Text;
      documentType : {
        #questionPaper : ?{
          #finalExam;
          #curriculumBased;
          #samplePaper;
          #prescribedTextbook;
          #memoryBasedFromPeerCommunication;
          #useClassroomNotesOrCorrespondence;
        };
        #answerScript;
      };
      audience : {
        studentLevel : { #primary; #secondary; #higherSecondary; #undergraduate; #postgraduate };
        region : Text;
        language : Text;
      };
      createdTimestamp : Int;
      lastModifiedTimestamp : Int;
      versionHistory : [{
        id : Text;
        changeDescription : Text;
        timestamp : Int;
        author : Text;
      }];
      reviewComments : [{
        id : Text;
        reviewer : Text;
        commentText : Text;
        createdTimestamp : Int;
        lastModifiedTimestamp : Int;
        responses : [{
          id : Text;
          responder : Text;
          responseText : Text;
          timestamp : Int;
          responseType : { #directAnswer; #followUpQuestion; #clarification };
          supportsReview : Bool;
          supportsCorrection : Bool;
        }];
        attachments : ?[{
          id : Text;
          attachmentType : {
            #audio;
            #video;
            #document;
            #image;
            #solutionGuide;
            #correction;
            #clarificationRequest;
            #summary;
          };
          file : Storage.ExternalBlob;
          description : ?Text;
          createdBy : Text;
          timestamp : Int;
        }];
        rating : Nat;
        status : { #inProgress; #completed; #needsRevision };
        expertiseLevel : {
          #reviewer : Text;
          #subjectExpert : Text;
          #educator;
          #pedagogicalExpert;
          #contentHandler;
          #student : Text;
        };
        suggestedCorrections : ?[Text];
        clarificationRequests : ?[{
          id : Text;
          requester : Text;
          requestText : Text;
          timestamp : Int;
          requestedTopic : Text;
          urgency : { #lowPriority; #mediumPriority; #highPriority };
          additionalMaterials : ?[Storage.ExternalBlob];
          expectedResponseFormat : ?Text;
          relatedToQuestion : ?Text;
        }];
      }];
      extractedQuestions : [Text];
      categorizedTopics : [Text];
      practiceResources : ?[Text];
      bottomLineSuggestions : ?[Text];
      additionalSupportContacts : [{
        name : Text;
        contactType : { #phone; #email; #website; #messagingApp; #coach; #consultant };
        contactDetails : Text;
        description : ?Text;
        region : ?Text;
        language : ?Text;
      }];
      learningIntelligenceInsights : ?{
        aiAnalysisLevel : { #basic; #intermediate; #advanced };
        learningStyleRecommendation : ?Text;
        improvementSuggests : ?[Text];
        advancedRecommendations : ?[Text];
        prioritizationScoring : ?Nat;
        predictedOutcome : ?Text;
        adaptiveSchedule : ?{
          id : Text;
          startTime : Int;
          endTime : Int;
          description : ?Text;
          repeating : Bool;
          repeatInterval : ?{
            #daily;
            #weekly;
            #monthly;
            #custom : Nat;
          };
        };
        progressTracking : ?[{
          id : Text;
          progressDescription : Text;
          progressTimestamp : Int;
          progressScore : Nat;
        }];
      };
      cognitiveSkillsRating : ?{
        problemSolving : Nat;
        criticalThinking : Nat;
        memoryRetention : Nat;
        organization : Nat;
        creativity : Nat;
      };
      reviewStatus : { #inProgress; #completed; #needsRevision };
    }>;
    documentReviewsMap : Map.Map<Text, {
      id : Text;
      reviewer : Text;
      commentText : Text;
      createdTimestamp : Int;
      lastModifiedTimestamp : Int;
      responses : [{
        id : Text;
        responder : Text;
        responseText : Text;
        timestamp : Int;
        responseType : { #directAnswer; #followUpQuestion; #clarification };
        supportsReview : Bool;
        supportsCorrection : Bool;
      }];
      attachments : ?[{
        id : Text;
        attachmentType : {
          #audio;
          #video;
          #document;
          #image;
          #solutionGuide;
          #correction;
          #clarificationRequest;
          #summary;
        };
        file : Storage.ExternalBlob;
        description : ?Text;
        createdBy : Text;
        timestamp : Int;
      }];
      rating : Nat;
      status : { #inProgress; #completed; #needsRevision };
      expertiseLevel : {
        #reviewer : Text;
        #subjectExpert : Text;
        #educator;
        #pedagogicalExpert;
        #contentHandler;
        #student : Text;
      };
      suggestedCorrections : ?[Text];
      clarificationRequests : ?[{
        id : Text;
        requester : Text;
        requestText : Text;
        timestamp : Int;
        requestedTopic : Text;
        urgency : { #lowPriority; #mediumPriority; #highPriority };
        additionalMaterials : ?[Storage.ExternalBlob];
        expectedResponseFormat : ?Text;
        relatedToQuestion : ?Text;
      }];
    }>;
    parentFeedbackMap : Map.Map<Text, {
      parentId : Text;
      feedbackText : Text;
      feedbackTimestamp : Int;
      feedbackPurpose : Text;
    }>;
    aiPerformanceReviewsMap : Map.Map<Text, {
      analysis : Text;
      recommendations : [{
        description : Text;
        remedyType : Text;
      }];
      aiAnalysisLevel : { #basic; #intermediate; #advanced };
      resourceLinks : [Text];
    }>;
    icTechnologyTipsMap : Map.Map<Text, {
      id : Text;
      tipText : Text;
      relevantTechnology : Text;
      timestamp : Int;
    }>;
    globalFightsSolved : Nat;
    globalFightsCreated : Nat;
  } {
    let migratedProfiles = Map.empty<Principal, {
      displayName : Text;
      avatar : ?Storage.ExternalBlob;
      location : ?{
        latitude : Float;
        longitude : Float;
        timestamp : Int;
      };
      role : ?{
        #parent;
        #child;
      };
      lastUpdate : Int;
      parents : [{
        name : Text;
        principal : Principal;
      }];
      children : [{
        name : Text;
        principal : Principal;
      }];
      totalExpenses : {
        entries : [{
          category : {
            #fees;
            #groceries;
            #other;
          };
          amount : Nat;
          timestamp : Int;
        }];
        totalFees : Nat;
        totalGroceries : Nat;
        totalOther : Nat;
      };
      aiRemedyEnabled : Bool;
    }>();

    for ((principal, profile) in old.userProfiles.entries()) {
      let newProfile = {
        profile with
        aiRemedyEnabled = true
      };
      migratedProfiles.add(principal, newProfile);
    };

    {
      userProfiles = migratedProfiles;
      updates = old.updates;
      mediaPosts = old.mediaPosts;
      reminders = old.reminders;
      messages = old.messages;
      permissionRequests = old.permissionRequests;
      invitationTokens = old.invitationTokens;
      educationalDataMap = old.educationalDataMap;
      documentMetadataMap = old.documentMetadataMap;
      documentReviewsMap = old.documentReviewsMap;
      parentFeedbackMap = old.parentFeedbackMap;
      aiPerformanceReviewsMap = old.aiPerformanceReviewsMap;
      icTechnologyTipsMap = old.icTechnologyTipsMap;
      globalFightsSolved = old.fightsSolved;
      globalFightsCreated = old.fightsCreated;
    };
  };
};
