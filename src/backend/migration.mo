import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type Role = {
    #parent;
    #child;
  };

  type FamilyMember = {
    name : Text;
    principal : Principal;
  };

  type ExpenseCategory = {
    #fees;
    #groceries;
    #other;
  };

  type ExpenseEntry = {
    category : ExpenseCategory;
    amount : Nat;
    timestamp : Int;
  };

  type Expenses = {
    entries : [ExpenseEntry];
    totalFees : Nat;
    totalGroceries : Nat;
    totalOther : Nat;
  };

  type UserProfile = {
    displayName : Text;
    avatar : ?Storage.ExternalBlob;
    location : ?Location;
    role : ?Role;
    lastUpdate : Int;
    parents : [FamilyMember];
    children : [FamilyMember];
    totalExpenses : Expenses;
  };

  type Location = {
    latitude : Float;
    longitude : Float;
    timestamp : Int;
  };

  type PermissionType = {
    #goOut;
    #playGames;
    #watchYouTube;
  };

  type PermissionRequest = {
    id : Text;
    child : Principal;
    requestType : PermissionType;
    reason : Text;
    granted : Bool;
    timestamp : Int;
    parent : Principal;
  };

  type Update = {
    author : Principal;
    text : Text;
    timestamp : Int;
  };

  type Media = {
    author : Principal;
    file : Storage.ExternalBlob;
    timestamp : Int;
    description : Text;
  };

  type Reminder = {
    creator : Principal;
    text : Text;
    dueDate : Int;
    timestamp : Int;
  };

  // Old implementation had only text messages
  type OldMessage = {
    author : Principal;
    receiver : Principal;
    text : Text;
    timestamp : Int;
  };

  // New message types
  type MessageType = {
    #text;
    #groceryList;
    #socialMediaLink;
  };

  type Message = {
    author : Principal;
    receiver : Principal;
    text : Text;
    messageType : MessageType;
    groceryItems : ?[Text];
    socialMediaUrl : ?Text;
    timestamp : Int;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    updates : List.List<Update>;
    mediaPosts : List.List<Media>;
    reminders : List.List<Reminder>;
    messages : List.List<OldMessage>;
    permissionRequests : Map.Map<Text, PermissionRequest>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    updates : List.List<Update>;
    mediaPosts : List.List<Media>;
    reminders : List.List<Reminder>;
    messages : List.List<Message>;
    permissionRequests : Map.Map<Text, PermissionRequest>;
  };

  public func run(old : OldActor) : NewActor {
    let newMessages = old.messages.map<OldMessage, Message>(
      func(oldMsg) {
        {
          oldMsg with
          messageType = #text;
          groceryItems = null;
          socialMediaUrl = null;
        };
      }
    );
    {
      old with
      messages = newMessages;
    };
  };
};
