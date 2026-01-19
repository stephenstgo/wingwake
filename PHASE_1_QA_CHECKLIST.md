# Phase 1 Quality Assurance Checklist
## Weeks 1, 2, and 3 Testing Guide

This document provides comprehensive testing steps for all Phase 1 features implemented in Weeks 1-3.

**Note:** Items marked with ✅ **VERIFIED** have been programmatically verified (code exists, structure is correct, no linting errors). Items marked as "(runtime test)" require manual testing in a running application.

**⚠️ IMPORTANT**: This project has been migrated from Supabase to Convex. All database operations now use Convex queries, mutations, and actions instead of Supabase SQL. Authentication uses Convex Auth, and file storage uses Convex's built-in storage.

**See Also:**
- `CONVEX_MIGRATION.md` - Detailed migration documentation
- `CONVEX_SETUP_COMPLETE.md` - Quick setup guide
- `SETUP_CONVEX.md` - Step-by-step setup instructions

---

## Week 1: Database & Basic Infrastructure

### ✅ Convex Database Setup

#### Test: Convex Schema & Setup
- [x] ✅ **VERIFIED**: Convex schema exists in `convex/schema.ts`
- [x] ✅ **VERIFIED**: All tables defined in Convex schema:
  - `profiles` ✅
  - `organizations` ✅
  - `organizationMembers` ✅
  - `aircraft` ✅
  - `ferryFlights` ✅
  - `discrepancies` ✅
  - `mechanicSignoffs` ✅
  - `faaPermits` ✅
  - `documents` ✅
  - `pilotQualifications` ✅
  - `insurancePolicies` ✅
  - `auditLogs` ✅
- [x] ✅ **VERIFIED**: Convex queries exist for all entities (`convex/queries/*`)
- [x] ✅ **VERIFIED**: Convex mutations exist for all entities (`convex/mutations/*`)
- [x] ✅ **VERIFIED**: Convex actions exist for file operations (`convex/actions/*`)
- [ ] Run `npx convex dev` and verify schema syncs successfully (runtime test)
- [ ] Verify Convex dashboard shows all tables (runtime test)
- [ ] Test creating a record in each table via Convex dashboard (runtime test)

#### Test: Convex Queries & Mutations
- [ ] Test each query function (runtime test):
  - [ ] `getProfile`, `getProfileByEmail`, `getCurrentUserProfile`
  - [ ] `getOrganization`, `getUserOrganizations`
  - [ ] `getAircraft`, `getAircraftByNNumber`
  - [ ] `getFerryFlight`, `getUserFerryFlights`, `getAllFerryFlights`
  - [ ] `getDiscrepanciesByFlight`
  - [ ] `getDocumentsByFlight`
- [ ] Test each mutation function (runtime test):
  - [ ] `createProfile`, `updateProfile`, `syncAuthProfile`
  - [ ] `createOrganization`, `addMemberToOrganization`
  - [ ] `createAircraft`, `updateAircraft`
  - [ ] `createFerryFlight`, `updateFerryFlight`
  - [ ] `createDiscrepancy`, `createSignoff`, `createPermit`
- [ ] Verify mutations update `updatedAt` timestamps correctly (runtime test)

#### Test: Convex Authentication & Authorization
- [x] ✅ **VERIFIED**: Convex Auth configured in `convex/auth.ts`
- [x] ✅ **VERIFIED**: AuthContext uses Convex Auth hooks
- [x] ✅ **VERIFIED**: Login/signup pages use Convex Auth
- [ ] Test authentication flow (runtime test):
  - [ ] Sign up with new account
  - [ ] Verify profile is automatically created via `syncAuthProfile`
  - [ ] Sign in with existing account
  - [ ] Verify profile loads correctly
  - [ ] Sign out
  - [ ] Verify redirects to login page
- [ ] Test authorization (runtime test):
  - [ ] As authenticated user, verify can access dashboard
  - [ ] As unauthenticated user, verify redirects to login
  - [ ] Test profile-based access control (users see their own data)
  - [ ] Test organization-based access control (members see org data)

### ✅ Convex File Storage

#### Test: Convex File Storage
- [x] ✅ **VERIFIED**: File storage actions exist in `convex/actions/documents.ts`
- [x] ✅ **VERIFIED**: `getUploadUrl` action exists
- [x] ✅ **VERIFIED**: `uploadDocument` action exists
- [x] ✅ **VERIFIED**: `getDocumentDownloadUrl` action exists
- [ ] Test file upload (runtime test):
  - [ ] Call `getUploadUrl` to get upload URL
  - [ ] Upload file to Convex storage
  - [ ] Verify file is stored and `storageId` is saved
  - [ ] Verify document record is created in database
- [ ] Test file download (runtime test):
  - [ ] Call `getDocumentDownloadUrl` to get signed URL
  - [ ] Verify URL is valid and file downloads
  - [ ] Test download permissions (users can only download their own files)
- [ ] Test file size limits (runtime test):
  - [ ] Upload file within size limit (should succeed)
  - [ ] Upload file exceeding size limit (should fail)

### ✅ Environment Variables

#### Test: Configuration
- [x] ✅ **VERIFIED**: `env.example` file exists with Convex variables documented
- [x] ✅ **VERIFIED**: Environment variables are referenced in code:
  - `NEXT_PUBLIC_CONVEX_URL` (used in `lib/convex/provider.tsx`, `lib/convex/server.ts`)
  - `CONVEX_AUTH_TOKEN` (optional, for server-side auth)
  - `NEXT_PUBLIC_SUPABASE_URL` (legacy, for data migration only)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy, for data migration only)
- [ ] Verify `.env.local` file exists with `NEXT_PUBLIC_CONVEX_URL` set (manual check)
- [ ] Test application starts without environment variable errors (runtime test)
- [ ] Verify Convex client connects successfully (runtime test)
- [ ] Test that missing `NEXT_PUBLIC_CONVEX_URL` shows helpful error message (runtime test)

### ✅ Error Handling

#### Test: Global Error Boundary
- [x] ✅ **VERIFIED**: `app/error.tsx` exists (Next.js App Router error boundary)
- [x] ✅ **VERIFIED**: `components/error-boundary.tsx` exists (React error boundary)
- [x] ✅ **VERIFIED**: Test errors page exists at `app/dashboard/test-errors/page.tsx`
- [ ] Navigate to `/dashboard/test-errors` (runtime test)
- [ ] Click "Trigger Client Error" button (runtime test)
- [ ] Verify error boundary displays with error message (runtime test)
- [ ] Verify "Try Again" button works (runtime test)
- [ ] Test server error handling:
  - [ ] Navigate to non-existent flight ID (runtime test)
  - [ ] Verify 404 page displays correctly (runtime test)

#### Test: Toast Notifications
- [x] ✅ **VERIFIED**: `components/toast.tsx` implements toast system with all 4 types (success, error, info, warning)
- [x] ✅ **VERIFIED**: `ToastProvider` is integrated in `app/layout.tsx`
- [x] ✅ **VERIFIED**: Components using toast notifications:
  - `components/aircraft-form.tsx` (success, error)
  - `components/aircraft-list.tsx` (success, error)
  - `components/organization-form.tsx` (success, error)
  - `components/organization-members.tsx` (success, error)
  - `components/documents-list.tsx` (success, error)
  - `components/document-upload-form.tsx` (success, error)
  - `components/status-transition-button.tsx` (success, error)
  - `components/complete-flight-modal.tsx` (success, error)
- [x] ✅ **VERIFIED**: Test errors page includes toast testing buttons
- [ ] Test success toast (runtime test):
  - [ ] Create a new aircraft
  - [ ] Verify green success toast appears
- [ ] Test error toast (runtime test):
  - [ ] Try invalid form submission
  - [ ] Verify red error toast appears
- [ ] Test info/warning toasts (runtime test):
  - [ ] Perform actions that trigger info messages
  - [ ] Verify appropriate toast appears

---

## Week 2: Core Ferry Flight Workflow

### ✅ Document Upload/Download (Convex File Storage)

#### Test: Document Upload
- [x] ✅ **VERIFIED**: `components/document-upload-form.tsx` exists with file validation
- [x] ✅ **VERIFIED**: `components/documents-list.tsx` exists with upload integration
- [x] ✅ **VERIFIED**: Convex actions for file upload exist (`convex/actions/documents.ts`)
- [x] ✅ **VERIFIED**: `lib/db/documents.ts` updated to use Convex
- [ ] Navigate to a ferry flight detail page (runtime test)
- [ ] Click "Upload Document" or use upload form (runtime test)
- [ ] Test Convex file upload flow:
  - [ ] Get upload URL from Convex action
  - [ ] Upload file to Convex storage
  - [ ] Verify `storageId` is saved in document record
  - [ ] Verify document appears in list
- [ ] Test file validation:
  - [ ] Upload file > 50MB (should fail)
  - [ ] Upload invalid file type (should fail)
  - [ ] Upload valid PDF (should succeed)
  - [ ] Upload valid image (should succeed)
- [ ] Test document categorization:
  - [ ] Upload file and verify auto-detection works
  - [ ] Manually select different category
  - [ ] Verify category is saved correctly
- [ ] Test upload with description:
  - [ ] Add optional description
  - [ ] Verify description is saved

#### Test: Document Download
- [ ] Navigate to documents tab on flight detail page
- [ ] Click download button on a document
- [ ] Test Convex file download flow:
  - [ ] Get download URL from Convex action
  - [ ] Verify file downloads successfully
  - [ ] Verify download URL is signed/valid
- [ ] Test download permissions:
  - [ ] As flight owner, download works
  - [ ] As non-owner, verify access is blocked

#### Test: Document List
- [ ] Verify documents are grouped by category
- [ ] Verify document metadata displays:
  - [ ] File name
  - [ ] Category badge
  - [ ] Upload date
  - [ ] File size
- [ ] Test document deletion:
  - [ ] Delete a document
  - [ ] Verify confirmation dialog appears
  - [ ] Verify document is removed from list

### ✅ Status Transitions

#### Test: Valid Transitions
- [x] ✅ **VERIFIED**: `components/status-transition-button.tsx` exists
- [x] ✅ **VERIFIED**: `lib/utils/status-transitions.ts` exists with transition validation
- [x] ✅ **VERIFIED**: `lib/actions/status-transitions.ts` exists with server actions
- [ ] Create a new ferry flight (status: `draft`) (runtime test)
- [ ] Test each valid transition:
  - [ ] `draft` → `inspection_pending` ✅
  - [ ] `inspection_pending` → `inspection_complete` ✅
  - [ ] `inspection_complete` → `faa_submitted` ✅
  - [ ] `faa_submitted` → `permit_issued` ✅
  - [ ] `permit_issued` → `scheduled` ✅
  - [ ] `scheduled` → `in_progress` ✅
  - [ ] `in_progress` → `completed` ✅
- [ ] Verify status updates in database
- [ ] Verify toast notification appears on success

#### Test: Invalid Transitions
- [ ] Try invalid transitions:
  - [ ] `draft` → `completed` (should be blocked) ❌
  - [ ] `completed` → `in_progress` (should be blocked) ❌
  - [ ] `draft` → `permit_issued` (should be blocked) ❌
- [ ] Verify error message appears
- [ ] Verify status does not change in database

#### Test: Status Transition UI
- [ ] Verify `StatusTransitionMenu` component:
  - [ ] Only shows valid next statuses
  - [ ] Does not show invalid transitions
  - [ ] Displays status names clearly
- [ ] Test status transition buttons:
  - [ ] Click transition button
  - [ ] Verify confirmation (if applicable)
  - [ ] Verify status updates

### ✅ Complete Flight Functionality

#### Test: Complete Flight Modal
- [ ] Navigate to flight in `in_progress` status
- [ ] Click "Mark Complete" or "Complete Flight" button
- [ ] Test date validation:
  - [ ] Enter arrival date before departure (should fail)
  - [ ] Enter valid dates (should succeed)
- [ ] Test completion:
  - [ ] Enter actual departure date/time
  - [ ] Enter actual arrival date/time
  - [ ] Submit form
  - [ ] Verify status changes to `completed`
  - [ ] Verify dates are saved
  - [ ] Verify success toast appears

#### Test: Complete Flight Validation
- [ ] Try to complete flight from invalid status:
  - [ ] From `draft` (should be blocked)
  - [ ] From `scheduled` (should be blocked)
- [ ] Verify error message appears

### ✅ Document Categorization

#### Test: Auto-Detection
- [ ] Upload file named "registration.pdf"
  - [ ] Verify auto-detects as "Registration"
- [ ] Upload file named "airworthiness_cert.pdf"
  - [ ] Verify auto-detects as "Airworthiness Certificate"
- [ ] Upload file named "logbook_entry.pdf"
  - [ ] Verify auto-detects as "Logbook Entry"

#### Test: Manual Selection
- [ ] Upload file and manually change category
- [ ] Verify selected category is saved
- [ ] Verify category badge displays correctly in list

#### Test: Document Types
- [ ] Verify all 8 document types are available:
  - [ ] Registration
  - [ ] Airworthiness Certificate
  - [ ] Logbook Entry
  - [ ] FAA Permit
  - [ ] Insurance
  - [ ] Mechanic Statement
  - [ ] Weight & Balance
  - [ ] Other

---

## Week 3: Essential Features

### ✅ Aircraft Management

#### Test: Aircraft List
- [x] ✅ **VERIFIED**: `app/dashboard/aircraft/page.tsx` exists
- [x] ✅ **VERIFIED**: `components/aircraft-list.tsx` exists
- [x] ✅ **VERIFIED**: `components/aircraft-form.tsx` exists
- [x] ✅ **VERIFIED**: `app/dashboard/aircraft/new/page.tsx` exists
- [x] ✅ **VERIFIED**: `app/dashboard/aircraft/[id]/edit/page.tsx` exists
- [x] ✅ **VERIFIED**: `lib/actions/aircraft.ts` exists with CRUD actions
- [ ] Navigate to `/dashboard/aircraft` (runtime test)
- [ ] Verify aircraft list displays:
  - [ ] N-number
  - [ ] Manufacturer and model
  - [ ] Serial number
  - [ ] Year
  - [ ] Base location
  - [ ] Owner organization
- [ ] Test empty state:
  - [ ] If no aircraft, verify empty state message
  - [ ] Verify "Add Aircraft" button appears

#### Test: Create Aircraft
- [ ] Click "Add Aircraft" button
- [ ] Fill out form:
  - [ ] N-number (required, format validation)
  - [ ] Manufacturer (optional)
  - [ ] Model (optional)
  - [ ] Serial number (optional)
  - [ ] Year (optional)
  - [ ] Base location (optional)
  - [ ] Owner organization (optional)
- [ ] Submit form
- [ ] Verify aircraft is created
- [ ] Verify success toast appears
- [ ] Verify redirect to aircraft list

#### Test: Edit Aircraft
- [ ] Click edit button on an aircraft
- [ ] Modify fields
- [ ] Submit form
- [ ] Verify changes are saved
- [ ] Verify success toast appears

#### Test: Delete Aircraft
- [ ] Click delete button on an aircraft
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion
- [ ] Verify aircraft is removed from list
- [ ] Verify success toast appears

#### Test: Aircraft Validation
- [ ] Test N-number format:
  - [ ] Valid: `N123AB` ✅
  - [ ] Invalid: `123AB` ❌
  - [ ] Invalid: `N123` ❌
- [ ] Test required fields:
  - [ ] Submit without N-number (should fail)
- [ ] Test year validation:
  - [ ] Year in future (should be allowed or validated)

### ✅ Organization Management

#### Test: Organization Creation
- [x] ✅ **VERIFIED**: `components/organization-form.tsx` exists
- [x] ✅ **VERIFIED**: `components/organization-list.tsx` exists
- [x] ✅ **VERIFIED**: `components/organization-members.tsx` exists
- [x] ✅ **VERIFIED**: `app/dashboard/account/page.tsx` includes organization management
- [ ] Navigate to `/dashboard/account` (runtime test)
- [ ] If no organizations exist:
  - [ ] Verify "Create Organization" form appears
- [ ] Fill out form:
  - [ ] Organization name (required)
  - [ ] Organization type (required)
- [ ] Submit form
- [ ] Verify organization is created
- [ ] Verify user is automatically added as owner
- [ ] Verify success toast appears

#### Test: Organization Types
- [ ] Verify all 4 types are available:
  - [ ] Individual
  - [ ] LLC
  - [ ] Corporation
  - [ ] Partnership
- [ ] Create organization with each type
- [ ] Verify type is saved correctly

#### Test: Organization Display
- [ ] Verify organizations list shows:
  - [ ] Organization name
  - [ ] Organization type badge
  - [ ] Member list

### ✅ User Management

#### Test: Invite User to Organization
- [ ] Navigate to organization section in account settings
- [ ] Click "Invite User" button
- [ ] Fill out form:
  - [ ] Email address (required)
  - [ ] Role (required): Member, Manager, or Owner
- [ ] Submit form
- [ ] Test scenarios:
  - [ ] Invite existing user (should succeed)
  - [ ] Invite non-existent user (should show error message)
- [ ] Verify success toast appears
- [ ] Verify user appears in member list

#### Test: User Roles
- [ ] Test role assignment:
  - [ ] Invite as Member
  - [ ] Invite as Manager
  - [ ] Invite as Owner
- [ ] Verify role displays correctly in member list
- [ ] Verify role icons display correctly

#### Test: Remove User from Organization
- [ ] Click remove button on a member
- [ ] Verify confirmation dialog appears
- [ ] Confirm removal
- [ ] Verify member is removed from list
- [ ] Verify success toast appears

#### Test: Permission-Based Access
- [ ] Test as Owner:
  - [ ] Can invite users ✅
  - [ ] Can remove users ✅
- [ ] Test as Manager:
  - [ ] Can invite users ✅
  - [ ] Can remove users ✅
- [ ] Test as Member:
  - [ ] Cannot invite users ❌
  - [ ] Cannot remove users ❌

### ✅ Missing Document Warnings

#### Test: Warning Display
- [x] ✅ **VERIFIED**: `components/missing-documents-warning.tsx` exists
- [x] ✅ **VERIFIED**: Component integrated in `components/ferry-flight-detail.tsx`
- [ ] Navigate to flight in `inspection_pending` status (runtime test)
- [ ] Verify missing documents warning appears:
  - [ ] Yellow warning card
  - [ ] Lists required documents
- [ ] Upload required documents
- [ ] Verify warning changes to green success message
- [ ] Verify "All required documents are present" message

#### Test: Status-Based Requirements
- [ ] Test each status requirement:
  - [ ] `inspection_pending`: Registration, Airworthiness Certificate
  - [ ] `inspection_complete`: + Logbook Entry, Mechanic Statement
  - [ ] `faa_submitted`: + Insurance
  - [ ] `permit_issued` and beyond: + FAA Permit
- [ ] Verify correct documents are required for each status

#### Test: Document Detection
- [ ] Upload document with matching filename
- [ ] Verify it's detected as required document
- [ ] Verify warning updates accordingly

### ✅ Status Timeline (History)

#### Test: Status Timeline Display
- [x] ✅ **VERIFIED**: `components/status-history.tsx` exists (renamed to StatusTimeline)
- [x] ✅ **VERIFIED**: `lib/db/audit-logs.ts` exists with query functions
- [x] ✅ **VERIFIED**: `lib/actions/audit-logs.ts` exists with server actions
- [x] ✅ **VERIFIED**: Status timeline integrated in `components/flight-page-template.tsx` and `components/ferry-flight-detail.tsx`
- [ ] Navigate to flight detail page (runtime test)
- [ ] Verify "Status Timeline" appears in Activity Log section
- [ ] If status history exists:
  - [ ] Verify timeline displays status transitions
  - [ ] Verify "from → to" format displays correctly
  - [ ] Verify timestamps display
  - [ ] Verify user information displays (if available)
- [ ] If no status history:
  - [ ] Verify "No status history available" message

#### Test: Status Timeline Tab
- [ ] Navigate to flight detail page
- [ ] Click "History" tab
- [ ] Verify Status Timeline displays in dedicated tab
- [ ] Verify timeline shows all status changes
- [ ] Verify timeline is ordered correctly (newest first)

#### Test: Status Change Logging
- [ ] Perform status transition
- [ ] Verify entry appears in status timeline
- [ ] Verify correct from/to statuses are shown
- [ ] Verify timestamp is accurate

---

## Cross-Feature Testing

### ✅ Integration Tests

#### Test: Complete Workflow (Convex)
1. [ ] Sign up/login with Convex Auth
2. [ ] Verify profile is created/synced automatically
3. [ ] Create organization (using Convex mutation)
4. [ ] Create aircraft (using Convex mutation)
5. [ ] Create ferry flight (using Convex mutation)
6. [ ] Upload required documents (using Convex file storage)
7. [ ] Transition through statuses (using Convex mutations):
   - [ ] `draft` → `inspection_pending`
   - [ ] `inspection_pending` → `inspection_complete`
   - [ ] `inspection_complete` → `faa_submitted`
   - [ ] `faa_submitted` → `permit_issued`
   - [ ] `permit_issued` → `scheduled`
   - [ ] `scheduled` → `in_progress`
   - [ ] `in_progress` → `completed`
8. [ ] Verify status timeline shows all transitions (Convex queries)
9. [ ] Verify documents are accessible throughout (Convex file storage)
10. [ ] Complete flight with actual dates
11. [ ] Verify all data persists correctly in Convex
12. [ ] Verify data appears in Convex dashboard

#### Test: Multi-User Workflow (Convex Auth)
1. [ ] Sign up User A with Convex Auth
2. [ ] Create organization as User A (Convex mutation)
3. [ ] Sign up User B with Convex Auth
4. [ ] Invite User B to organization (Convex mutation)
5. [ ] As User B, verify access to organization's flights (Convex queries)
6. [ ] As User B, verify can view documents (Convex file storage)
7. [ ] As User B, verify cannot delete flights (if not owner) - Convex mutation should fail
8. [ ] Test permission boundaries (verify Convex queries filter correctly)
9. [ ] Test real-time updates (User A creates flight, User B sees it immediately)

### ✅ Error Scenarios

#### Test: Network Errors
- [ ] Disconnect network
- [ ] Try to upload document (should show error)
- [ ] Try to change status (should show error)
- [ ] Verify error messages are user-friendly

#### Test: Invalid Data
- [ ] Try to create aircraft with duplicate N-number
- [ ] Try to create organization with duplicate name
- [ ] Try to invite user that's already a member
- [ ] Verify appropriate error messages

#### Test: Permission Errors
- [ ] As non-owner, try to delete flight
- [ ] As non-member, try to access organization data
- [ ] Verify RLS policies block unauthorized access
- [ ] Verify error messages are clear

---

## Performance Testing

### ✅ Load Testing
- [ ] Test with 100+ flights in database
- [ ] Verify aircraft list loads quickly
- [ ] Verify flight list loads quickly
- [ ] Verify status timeline loads quickly
- [ ] Test document upload with large files (up to 50MB)

### ✅ Convex Performance
- [x] ✅ **VERIFIED**: Indexes defined in Convex schema (by_email, by_owner, by_status, etc.)
- [ ] Test query performance (runtime test):
  - [ ] Verify queries use indexes correctly
  - [ ] Test with 100+ flights in database
  - [ ] Verify list queries are paginated or limited
  - [ ] Check for unnecessary data fetching
- [ ] Test real-time subscriptions (runtime test):
  - [ ] Verify `useQuery` hooks update in real-time
  - [ ] Test that changes reflect immediately across tabs

---

## Browser Compatibility

### ✅ Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Verify all features work in each browser

### ✅ Mobile Responsiveness
- [ ] Test on mobile device (iOS)
- [ ] Test on mobile device (Android)
- [ ] Verify forms are usable on mobile
- [ ] Verify document upload works on mobile
- [ ] Verify status timeline displays correctly

---

## Security Testing

### ✅ Authentication (Convex Auth)
- [x] ✅ **VERIFIED**: Convex Auth configured with Password provider
- [x] ✅ **VERIFIED**: Login/signup pages use Convex Auth
- [x] ✅ **VERIFIED**: AuthContext uses Convex Auth hooks
- [ ] Test authentication flow (runtime test):
  - [ ] Sign up with email/password
  - [ ] Verify profile is created automatically
  - [ ] Sign in with credentials
  - [ ] Verify session persists
  - [ ] Sign out
  - [ ] Verify session is cleared
- [ ] Verify unauthenticated users cannot access dashboard (runtime test)
- [ ] Test profile sync (runtime test):
  - [ ] Sign in as new user
  - [ ] Verify `syncAuthProfile` creates profile
  - [ ] Verify profile data matches auth identity

### ✅ Authorization (Convex Queries)
- [ ] Test query-level authorization (runtime test):
  - [ ] Verify `getUserFerryFlights` only returns user's flights
  - [ ] Verify `getUserOrganizations` only returns user's orgs
  - [ ] Test cross-organization data access (should be blocked)
  - [ ] Verify users cannot query data they shouldn't access
- [ ] Test mutation-level authorization (runtime test):
  - [ ] Verify users can only create flights for their organizations
  - [ ] Verify users can only update their own data
  - [ ] Test unauthorized mutation attempts (should fail)

### ✅ Data Validation
- [x] ✅ **VERIFIED**: Convex schema validation (v.string(), v.number(), etc.)
- [ ] Test input validation (runtime test):
  - [ ] Try to create flight with invalid status (should fail)
  - [ ] Try to create aircraft with invalid N-number format (should fail)
  - [ ] Test XSS attempts in text fields (should be sanitized)
  - [ ] Verify file upload validation works (size, type)
- [ ] Test Convex argument validation (runtime test):
  - [ ] Pass wrong types to mutations (should fail with clear error)
  - [ ] Pass missing required fields (should fail)

---

## Documentation

### ✅ Code Documentation
- [ ] Verify all new functions have JSDoc comments
- [ ] Verify complex logic has inline comments
- [ ] Verify README is updated if needed

### ✅ User Documentation
- [ ] Verify error messages are clear
- [ ] Verify success messages are informative
- [ ] Verify UI labels are descriptive

---

## Convex-Specific Testing Requirements

### ✅ Convex Dev Server
- [ ] Verify Convex dev server is running before testing
- [ ] Check Convex dashboard shows all tables
- [ ] Verify functions are synced (no "function not found" errors)
- [ ] Test that schema changes sync automatically

### ✅ Real-time Updates
- [ ] Open application in two browser tabs
- [ ] Create/update data in one tab
- [ ] Verify changes appear immediately in other tab
- [ ] Test that `useQuery` hooks update automatically

### ✅ Type Safety
- [ ] Verify no TypeScript errors in Convex functions
- [ ] Test that invalid argument types are caught
- [ ] Verify generated types are correct

### ✅ Error Handling
- [ ] Test Convex-specific errors (ArgumentValidationError, etc.)
- [ ] Verify error messages are user-friendly
- [ ] Test handling of missing environment variables

### ✅ Data Seeding
- [ ] Run `/api/seed/example-data` endpoint
- [ ] Verify data appears in Convex dashboard
- [ ] Verify all tables have seeded data
- [ ] Test that components display seeded data correctly

## Sign-Off

### Testing Completed By
- **Tester Name:** ________________
- **Date:** ________________
- **Environment:** ________________ (Development/Staging/Production)
- **Convex Deployment URL:** ________________

### Issues Found
- [ ] No issues found
- [ ] Issues documented in: ________________

### Approval
- **Approved By:** ________________
- **Date:** ________________

---

## Convex-Specific Testing Notes

### Key Differences from Supabase Testing

1. **No SQL Queries**: All database operations use Convex queries/mutations
2. **Real-time by Default**: Convex queries automatically update when data changes
3. **Type Safety**: Convex provides TypeScript types for all operations
4. **No RLS Policies**: Authorization is handled in query/mutation logic
5. **File Storage**: Uses Convex's built-in storage instead of Supabase Storage

### Convex Testing Checklist

- [ ] Verify Convex dev server is running before testing
- [ ] Check Convex dashboard for data after operations
- [ ] Test real-time updates (open multiple tabs, verify sync)
- [ ] Verify TypeScript types are correct (no type errors)
- [ ] Test error handling for Convex-specific errors
- [ ] Verify profile sync works after authentication
- [ ] Test data seeding script (`/api/seed/example-data`)

### Migration-Specific Tests

- [ ] Verify seeded data appears in Convex dashboard
- [ ] Test that components display Convex data correctly
- [ ] Verify data conversion (camelCase vs snake_case) works
- [ ] Test ID conversion (Convex Id vs UUID) works
- [ ] Verify timestamps are converted correctly (numbers vs ISO strings)

## Notes

- Run tests in a clean environment when possible
- Document any bugs or issues found during testing
- Retest after fixes are applied
- Keep this checklist updated as features evolve
- **IMPORTANT**: Always ensure Convex dev server is running before testing
- Check Convex dashboard to verify data operations
