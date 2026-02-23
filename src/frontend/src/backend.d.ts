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
    receiver: Principal;
}
export interface ExpenseEntry {
    timestamp: bigint;
    category: ExpenseCategory;
    amount: bigint;
}
export interface Expenses {
    totalOther: bigint;
    totalGroceries: bigint;
    totalFees: bigint;
    entries: Array<ExpenseEntry>;
}
export interface UserProfile {
    displayName: string;
    role?: Role;
    lastUpdate: bigint;
    children: Array<FamilyMember>;
    totalExpenses: Expenses;
    parents: Array<FamilyMember>;
    location?: Location;
    avatar?: ExternalBlob;
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
    createProfile(displayName: string, role: Role): Promise<void>;
    getActiveFamilyInvitations(): Promise<Array<FamilyInvitation>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExpenseSummary(): Promise<Expenses>;
    getMessageHistory(): Promise<Array<Message>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeChild(childPrincipal: Principal): Promise<void>;
    removeParent(parentPrincipal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(receiver: Principal, text: string, messageType: MessageType, groceryItems: Array<string> | null, socialMediaUrl: string | null): Promise<void>;
    updateUserProfile(profile: UserProfile): Promise<void>;
    validateFamilyInvitationToken(token: string, child: Principal): Promise<Principal>;
}
