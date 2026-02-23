# Specification

## Summary
**Goal:** Fix React minified error #185 causing runtime failure in the deployed application.

**Planned changes:**
- Investigate and resolve React error #185 (hydration mismatch or invalid DOM nesting)
- Audit all frontend components for invalid HTML nesting violations
- Check Dashboard.tsx, Chat.tsx, Settings.tsx, and Layout.tsx for hydration mismatches
- Verify React hooks in role-based widget rendering on Dashboard.tsx
- Review ProfileSetupModal and ChatWidget for improper portal usage or DOM violations
- Enable non-minified build or add source maps to get full error details
- Test application end-to-end after fixes

**User-visible outcome:** Application loads and renders correctly without React errors in the browser console, with all pages and components displaying properly.
