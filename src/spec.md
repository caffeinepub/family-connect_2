# Specification

## Summary
**Goal:** Enable users to send grocery lists and social media links in the family chat, in addition to regular text messages.

**Planned changes:**
- Extend the Message data type to support three message types: text, groceryList, and socialMediaLink
- Add optional fields for grocery items array and social media URL to the Message structure
- Update backend sendMessage method to accept and validate grocery items and social media URLs
- Add UI components for composing grocery lists with add/remove item functionality
- Add input field for social media links with basic URL validation
- Display grocery lists as formatted lists with checkboxes or bullet points
- Display social media links as clickable link preview cards
- Add message type selector to switch between text, grocery list, and link modes

**User-visible outcome:** Family members can send grocery shopping lists with multiple items and share social media links in the chat, with each message type displaying with its own distinct visual style.
