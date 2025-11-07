# Story 1.5: Create Basic Dashboard Layout

Status: done

## Story

As a logged-in user,
I want to see a dashboard after login,
So that I can navigate to different features of the application.

## Acceptance Criteria

1. **Given** an authenticated user
   **When** they log in successfully
   **Then** they are redirected to the dashboard page

2. **And** dashboard displays user's name/email from session

3. **And** navigation menu includes links for future features (placeholder)

4. **And** logout button is visible and functional

5. **And** responsive layout works on mobile and desktop

## Tasks / Subtasks

- [x] **Task 1: Create dashboard page route** (AC: #1)
  - [x] Create `/app/(app)/dashboard/page.tsx` as a protected route
  - [x] Configure route to require authentication (already protected by middleware from Story 1.4)
  - [x] Verify redirect from login page goes to dashboard
  - [x] Test that unauthenticated access redirects to login

- [x] **Task 2: Display user information** (AC: #2)
  - [x] Use NextAuth `useSession()` hook to retrieve session data
  - [x] Display user email from session
  - [x] Add welcome message with user's email
  - [x] Handle loading state while session is being fetched
  - [x] Handle case where session data is incomplete

- [x] **Task 3: Create navigation menu** (AC: #3)
  - [x] Design navigation layout (top nav bar recommended)
  - [x] Add placeholder navigation links:
    - Dashboard (current page)
    - Learn (future - Epic 2)
    - Flashcards (future - Epic 3)
    - Profile (future)
  - [x] Style navigation with Tailwind CSS
  - [x] Add active state indication for current route
  - [x] Mark future links as "Coming Soon" or disabled state

- [x] **Task 4: Integrate logout functionality** (AC: #4)
  - [x] Import and integrate LogoutButton component (created in Story 1.4)
  - [x] Place logout button in navigation area (top-right recommended)
  - [x] Test logout flow redirects to login page
  - [x] Verify session is cleared after logout
  - [x] Test that dashboard is inaccessible after logout

- [x] **Task 5: Implement responsive layout** (AC: #5)
  - [x] Use mobile-first approach with Tailwind CSS
  - [x] Test layout on mobile viewport (320px+)
  - [x] Test layout on tablet viewport (768px+)
  - [x] Test layout on desktop viewport (1024px+)
  - [x] Implement hamburger menu for mobile navigation
  - [x] Ensure touch targets meet accessibility standards (min 44x44px)

- [x] **Task 6: Create dashboard content area** (AC: #3)
  - [x] Design placeholder content area for future features
  - [x] Add welcome section with user greeting
  - [x] Add "Quick Actions" card section with placeholders:
    - Start Learning (link to /learn - disabled/coming soon)
    - Review Flashcards (link to /flashcards - disabled/coming soon)
    - View Progress (future feature)
  - [x] Style cards with consistent spacing and hover effects
  - [x] Add empty state messaging for content coming in later epics

- [x] **Task 7: Testing** (All ACs)
  - [x] Test successful login redirects to dashboard
  - [x] Test dashboard displays correct user information
  - [x] Test all navigation links render correctly
  - [x] Test logout button functionality
  - [x] Test responsive layout across breakpoints
  - [x] Test protected route behavior (redirects when not authenticated)
  - [x] Verify NextAuth session integration works correctly

## Dev Notes

### Architecture Constraints

**Routing:**
- Dashboard page: `apps/web/src/app/(app)/dashboard/page.tsx`
- Route group `(app)` for authenticated pages
- Already protected by middleware from Story 1.4 (`src/middleware.ts`)
- Protected routes: `/dashboard/*`, `/learn/*`, `/flashcards/*`

**Session Management:**
- NextAuth `useSession()` hook for client-side session access
- Session data includes: `user.id`, `user.email`, `user.created_at`
- Zustand auth store available at `stores/authStore.ts` (optional convenience layer)
- Session callbacks configured in `/api/auth/[...nextauth]/route.ts`

**Styling:**
- Tailwind CSS 3.4 with mobile-first approach
- Follow architecture component patterns (PascalCase files)
- Use Tailwind's responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Primary color: Light green (from PRD branding guidelines)

**Navigation Pattern:**
- Top navigation bar recommended (consistent with modern web apps)
- Logo/brand on left, user menu/logout on right
- Mobile: Hamburger menu collapsing to drawer
- Use Next.js `Link` component for client-side navigation

### Project Structure Notes

**Files to Create:**
```
apps/web/
├── src/
│   ├── app/
│   │   └── (app)/
│   │       └── dashboard/
│   │           └── page.tsx              # NEW - Dashboard page
│   └── components/
│       └── layout/
│           ├── AppNav.tsx                # NEW - Main navigation component
│           └── DashboardLayout.tsx       # NEW - Dashboard layout wrapper (optional)
```

**Files to Reference (Already Created):**
```
apps/web/
├── src/
│   ├── components/
│   │   └── auth/
│   │       └── LogoutButton.tsx          # REUSE - Logout button from Story 1.4
│   ├── stores/
│   │   └── authStore.ts                  # REUSE - Auth state management (optional)
│   └── middleware.ts                     # REFERENCE - Already protects /dashboard route
```

### Learnings from Previous Story

**From Story 1-4-implement-user-login-and-session-management (Status: review)**

- **LogoutButton Ready**: Fully functional LogoutButton component available at `components/auth/LogoutButton.tsx` - supports both button and link variants for flexible integration
- **Middleware Protection**: Dashboard route is already protected by middleware at `src/middleware.ts` - automatic redirect to /login for unauthenticated users with callbackUrl preservation
- **Auth Store Available**: Zustand store at `stores/authStore.ts` provides `useAuth()` hook with setUser, clearUser, updateUser actions - ready for client-side convenience (though NextAuth `useSession()` is primary)
- **Session Data Structure**: NextAuth session includes user.id, user.email, user.created_at (30-day expiry)
- **NextAuth Integration**: Session and JWT callbacks properly configured in `/api/auth/[...nextauth]/route.ts`

**Key Files to Reuse:**
- `apps/web/src/components/auth/LogoutButton.tsx` - Use in navigation bar (variant="button" or "link")
- `apps/web/src/stores/authStore.ts` - Optional: Use `useAuth()` for client-side convenience
- `apps/web/src/middleware.ts` - Dashboard already protected, no changes needed

**Integration Notes:**
- Login page already redirects to dashboard after successful authentication
- No additional route protection needed - middleware handles it
- LogoutButton already clears both NextAuth session and Zustand store
- Session persistence across page refreshes is working (Story 1.4 Task 3 complete)

**Implementation Approach:**
- Primary approach: Use NextAuth's `useSession()` hook for session data
- Secondary (optional): Sync session data to Zustand store on dashboard mount for offline-first features (future enhancement)
- LogoutButton integration: Import and place in navigation - no modifications needed
- Navigation structure: Create reusable AppNav component for use across all authenticated pages (foundation for Epic 2+)

[Source: stories/1-4-implement-user-login-and-session-management.md#Dev-Agent-Record]

### Testing Standards

**Unit Tests:**
- Test dashboard page renders for authenticated users
- Test user information display from session
- Test navigation links render correctly
- Test logout button integration
- Mock NextAuth session and test loading/error states

**Integration Tests:**
- Test login flow redirects to dashboard
- Test dashboard displays correct user data from real session
- Test logout flow from dashboard
- Test middleware protection (unauthenticated redirect)
- Test navigation between dashboard and other routes

**E2E Tests:**
- Test complete user journey: login → dashboard → logout
- Test dashboard displays user email after login
- Test logout button redirects to login page
- Test dashboard is inaccessible after logout (redirects to login)
- Test responsive layout on different viewport sizes
- Test navigation menu works on mobile and desktop
- Test accessibility: keyboard navigation, screen reader

### References

- [Source: docs/epics.md#Story-1.5] - Story requirements and acceptance criteria
- [Source: docs/architecture.md#Project-Structure] - Dashboard page location and route groups
- [Source: docs/architecture.md#Component-Patterns] - Component naming and organization conventions
- [Source: docs/PRD.md#Core-Screens] - Dashboard as Core Screen 2 with progress display requirements
- [Source: stories/1-4-implement-user-login-and-session-management.md] - LogoutButton component and auth infrastructure

## Dev Agent Record

### Completion Notes
**Completed:** 2025-11-08
**Definition of Done:** All acceptance criteria met, code reviewed, tests passing

### Context Reference

- docs/stories/1-5-create-basic-dashboard-layout.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
