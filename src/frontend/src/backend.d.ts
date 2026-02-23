import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Location {
    latitude: number;
    longitude: number;
    timestamp: bigint;
}
export interface FamilyMember {
    principal: Principal;
    name: string;
}
export interface PermissionRequest {
    id: string;
    child: Principal;
    granted: boolean;
    timestamp: bigint;
    requestType: PermissionType;
    parent: FamilyMember;
    reason: string;
}
export interface FamilyInvitation {
    created: bigint;
    token: string;
    expires: bigint;
    parentPrincipal: Principal;
    childPrincipal: Principal;
    isValid: boolean;
}
export interface Message {
    socialMediaUrl?: string;
    text: string;
    author: Principal;
    messageType: MessageType;
    groceryItems?: Array<string>;
    timestamp: bigint;
    chatType: ChatType;
    recipientId?: Principal;
}
export interface Expenses {
    totalOther: bigint;
    totalGroceries: bigint;
    totalFees: bigint;
    entries: Array<ExpenseEntry>;
}
export interface ExpenseEntry {
    timestamp: bigint;
    category: ExpenseCategory;
    amount: bigint;
}
export interface UserProfile {
    aiRemedyEnabled: boolean;
    displayName: string;
    role?: Role;
    lastUpdate: bigint;
    children: Array<FamilyMember>;
    totalExpenses: Expenses;
    parents: Array<FamilyMember>;
    location?: Location;
    avatar?: ExternalBlob;
}
export enum ChatType {
    privateChat = "privateChat",
    group = "group"
}
export enum ExpenseCategory {
    other = "other",
    fees = "fees",
    groceries = "groceries"
}
export enum MessageType {
    text = "text",
    socialMediaLink = "socialMediaLink",
    groceryList = "groceryList"
}
export enum PermissionType {
    goOut = "goOut",
    playGames = "playGames",
    watchYouTube = "watchYouTube"
}
export enum Role {
    child = "child",
    parent = "parent"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChild(childName: string, childPrincipal: Principal): Promise<void>;
    addExpense(category: ExpenseCategory, amount: bigint): Promise<void>;
    addParent(parentName: string, parentPrincipal: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createFamilyInvitationToken(child: Principal, validationTimeHours: bigint): Promise<string>;
    createPermissionRequest(parentPrincipal: Principal, requestType: PermissionType, reason: string): Promise<string>;
    createProfile(displayName: string, role: Role): Promise<void>;
    getAIRemedyEnabled(): Promise<boolean>;
    getActiveFamilyInvitations(): Promise<Array<FamilyInvitation>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExpenseSummary(): Promise<Expenses>;
    getFightsCreated(): Promise<bigint>;
    getFightsSolved(): Promise<bigint>;
    getMessageHistory(): Promise<Array<Message>>;
    getPermissionRequests(): Promise<Array<PermissionRequest>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    incrementFightsCreated(): Promise<void>;
    incrementFightsSolved(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    removeChild(childPrincipal: Principal): Promise<void>;
    removeParent(parentPrincipal: Principal): Promise<void>;
    respondToPermissionRequest(requestId: string, granted: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(text: string, messageType: MessageType, groceryItems: Array<string> | null, socialMediaUrl: string | null, chatType: ChatType, recipientId: Principal | null): Promise<void>;
    setAIRemedyEnabled(enabled: boolean): Promise<void>;
    updateUserProfile(profile: UserProfile): Promise<void>;
    validateFamilyInvitationToken(token: string, child: Principal): Promise<Principal>;
}
