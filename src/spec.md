# Specification

## Summary
**Goal:** Fix the ProfileSetupModal so it displays immediately when a user logs in without a role, and ensure the role selection (parent or child) is properly saved.

**Planned changes:**
- Debug and fix ProfileSetupModal in App.tsx to display automatically when userProfile.role is undefined
- Add enhanced debug logging to trace modal render state, visibility conditions, and role selection flow
- Verify role selection state management correctly detects when userProfile is loaded and role is undefined
- Ensure updateUserProfile mutation successfully saves the selected role and refetches the user profile
- Verify backend getUserProfile method returns complete UserProfile with role field

**User-visible outcome:** Users logging in without a role will immediately see the parent/child selection modal, be able to select their role, and have it properly saved to their profile.
