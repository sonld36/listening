# Story 1.4: Implement User Login and Session Management

Status: drafted

## Story

As a registered user,
I want to log in with my credentials and have my session maintained,
So that I can access personalized features without repeated authentication.

## Acceptance Criteria

1. **Given** a user with valid credentials
   **When** they submit the login form
   **Then** a secure session is created using NextAuth.js

2. **And** invalid credentials show appropriate error messages

3. **And** session persists across page refreshes

4. **And** protected routes redirect to login when unauthenticated

5. **And** logout functionality clears the session completely

## Tasks / Subtasks

- [ ] **Task 1: Create login page UI** (AC: #1, #2)
  - [ ] Create `/app/(auth)/login/page.tsx` route
  - [ ] Implement LoginForm component with email and password fields
  - [ ] Add client-side validation with Zod schema (reuse patterns from SignupForm)
  - [ ] Integrate React Hook Form for form state management
  - [ ] Display validation errors inline with user-friendly messages
  - [ ] Add "Remember me" checkbox (optional enhancement)

- [ ] **Task 2: Enhance NextAuth configuration for login** (AC: #1, #2)
  - [ ] Update `/api/auth/[...nextauth]/route.ts` with authorize callback
  - [ ] Implement credential verification using bcrypt password comparison
  - [ ] Query user from database using Prisma
  - [ ] Return user object on successful authentication
  - [ ] Return null with clear error message on failed authentication
  - [ ] Ensure JWT session strategy is properly configured

- [ ] **Task 3: Implement session persistence** (AC: #3)
  - [ ] Configure NextAuth session callbacks to include user data
  - [ ] Set up JWT callback to add custom user fields
  - [ ] Test session data availability across page refreshes
  - [ ] Verify session expiry (30 days per architecture)

- [ ] **Task 4: Create Zustand auth store for client state** (AC: #3)
  - [ ] Create `stores/authStore.ts` with user state management
  - [ ] Implement actions: setUser, clearUser, updateUser
  - [ ] Create useAuth hook wrapper for easy component access
  - [ ] Sync NextAuth session with Zustand store on app load

- [ ] **Task 5: Implement route protection with middleware** (AC: #4)
  - [ ] Create `middleware.ts` in app root
  - [ ] Configure matcher for protected routes (/dashboard, /learn, /flashcards)
  - [ ] Implement redirect to /login for unauthenticated users
  - [ ] Preserve intended destination URL for post-login redirect
  - [ ] Allow public routes (/login, /signup, landing page)

- [ ] **Task 6: Implement logout functionality** (AC: #5)
  - [ ] Add logout button to dashboard/navigation
  - [ ] Implement signOut from NextAuth on client
  - [ ] Clear Zustand auth store on logout
  - [ ] Redirect to login page after logout
  - [ ] Verify session is completely cleared from server

- [ ] **Task 7: Implement error handling** (AC: #2)
  - [ ] Handle invalid email error (AUTH_INVALID_CREDENTIALS)
  - [ ] Handle incorrect password error (AUTH_INVALID_CREDENTIALS)
  - [ ] Handle account not found error (AUTH_USER_NOT_FOUND)
  - [ ] Display user-friendly error messages in LoginForm
  - [ ] Add rate limiting consideration (note for future enhancement)

- [ ] **Task 8: Testing** (All ACs)
  - [ ] Write unit tests for login validation schema
  - [ ] Write unit tests for password verification
  - [ ] Write integration tests for NextAuth authorize callback
  - [ ] Test successful login flow end-to-end
  - [ ] Test invalid credentials handling
  - [ ] Test session persistence across page refresh
  - [ ] Test middleware route protection
  - [ ] Test logout functionality

## Dev Notes

### Architecture Constraints

**Authentication:**
- NextAuth.js 4.24.13 with credentials provider (already configured in Story 1.3)
- JWT sessions with 30-day expiry
- Password verification with bcrypt (use existing utilities from `lib/auth/password.ts`)
- Session management via NextAuth callbacks (session, jwt)

**Session Management:**
- JWT strategy for stateless authentication
- Session data includes: user id, email, created_at
- Client-side session access via `useSession()` hook and Zustand store
- Middleware-based route protection for protected pages

**Validation:**
- Zod for schema validation (client and server)
- React Hook Form for form state management
- Email validation: RFC 5322 compliant (reuse from Story 1.3)
- Login attempts should be rate-limited (note for future: 5 attempts/minute per architecture)

**API Patterns:**
- NextAuth handles authentication via `/api/auth/signin` (credentials provider)
- Response format follows architecture standard:
  ```typescript
  // Success via NextAuth
  { user: { id, email, ... }, session: { ... } }

  // Error via NextAuth
  // Returns null from authorize callback, displays error in UI
  ```

**Error Codes:**
- `AUTH_INVALID_CREDENTIALS` - Wrong email or password
- `AUTH_USER_NOT_FOUND` - Email not registered
- `AUTH_SESSION_EXPIRED` - Session expired, re-login required

### Project Structure Notes

**Files to Create:**
```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx          # NEW - Login page
│   │   └── middleware.ts              # NEW - Route protection middleware
│   ├── components/
│   │   └── auth/
│   │       └── LoginForm.tsx          # NEW - Login form component
│   └── stores/
│       └── authStore.ts               # NEW - Zustand auth state management
```

**Files to Modify:**
```
apps/web/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts       # MODIFY - Add authorize callback for credentials
│   └── lib/
│       └── validation/
│           └── auth.schema.ts         # MODIFY - Add login validation schema
```

**Files to Reference (Already Created in Story 1.3):**
```
apps/web/
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── AuthLayout.tsx         # REUSE - Shared auth page layout
│   │       └── SignupForm.tsx         # REFERENCE - Pattern for LoginForm
│   └── lib/
│       ├── auth/
│       │   └── password.ts            # REUSE - Password verification functions
│       └── prisma.ts                  # REUSE - Prisma client singleton
```

### Learnings from Previous Story

**From Story 1-3-implement-user-registration-flow (Status: in-progress)**

- **NextAuth.js Foundation Complete**: NextAuth is configured at `/api/auth/[...nextauth]/route.ts` with credentials provider and JWT strategy
- **Password Utilities Available**: Use `lib/auth/password.ts` for `verifyPassword()` function (complements `hashPassword()`)
- **Validation Patterns Established**: Zod schemas in `lib/validation/auth.schema.ts` - extend with `loginSchema`
- **Form Component Pattern**: SignupForm demonstrates React Hook Form + Zod integration - follow same pattern for LoginForm
- **Auth Layout Ready**: Reuse `components/auth/AuthLayout.tsx` for consistent auth page styling
- **Prisma Client Singleton**: Use `src/lib/prisma.ts` for all database queries
- **Environment Variables Set**: NEXTAUTH_SECRET and NEXTAUTH_URL already configured

**Key Files to Reuse:**
- `apps/web/src/lib/auth/password.ts` - Use `verifyPassword(plaintext, hash)` for login authentication
- `apps/web/src/lib/prisma.ts` - Use this Prisma client for user lookup by email
- `apps/web/src/components/auth/AuthLayout.tsx` - Wrap login page with this layout
- `apps/web/src/lib/validation/auth.schema.ts` - Add `loginSchema` alongside existing schemas

**Architectural Decisions from Story 1.3:**
- User model uses snake_case for database columns (`password_hash`, `created_at`)
- Email field has `@unique` constraint (use for user lookup)
- Error codes follow `AUTH_*` pattern for consistency
- Standard API response format applies to all endpoints

**Integration Notes:**
- Story 1.3 Task 5 is complete: Links between login/signup pages already implemented
- Login page should display success message when redirected from registration
- User can immediately login after registration with their new credentials

**Technical Implementation Details:**
- NextAuth authorize callback should:
  1. Validate credentials with Zod
  2. Query user by email using Prisma
  3. Verify password with bcrypt
  4. Return user object (without password_hash) on success
  5. Return null with error message on failure
- Middleware should use `withAuth` from next-auth/middleware
- Protected routes: `/dashboard/*`, `/learn/*`, `/flashcards/*`
- Public routes: `/`, `/login`, `/signup`, `/api/auth/*`

[Source: stories/1-3-implement-user-registration-flow.md]

### Testing Standards

**Unit Tests:**
- Test login Zod validation schema (email format, required fields)
- Test password verification function with correct/incorrect passwords
- Test Zustand auth store actions (setUser, clearUser)
- Mock NextAuth and Prisma for isolated testing

**Integration Tests:**
- Test NextAuth authorize callback with valid credentials
- Test authorize callback with invalid credentials
- Test authorize callback with non-existent user
- Test session persistence across requests
- Test middleware route protection logic

**E2E Tests:**
- Test complete login flow from page load to dashboard redirect
- Test login with invalid credentials shows error
- Test session persists across page refresh
- Test protected route redirects to login when not authenticated
- Test logout flow clears session and redirects to login
- Test post-registration login flow

### References

- [Source: docs/epics.md#Story-1.4] - Story acceptance criteria and technical notes
- [Source: docs/architecture.md#Authentication-Architecture] - NextAuth.js configuration, JWT sessions, session expiry
- [Source: docs/architecture.md#Security-Architecture] - Password hashing (bcrypt 12 rounds), session management
- [Source: docs/architecture.md#API-Patterns] - Error codes and response format
- [Source: docs/PRD.md#Story-1.2] - User authentication requirements (FR9)
- [Source: stories/1-3-implement-user-registration-flow.md] - Previous story context and created infrastructure

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
