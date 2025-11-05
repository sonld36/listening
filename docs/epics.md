# EWing - Epic Breakdown

**Author:** sonld
**Date:** 2025-11-06
**Project Level:** Level 3 (Multi-feature web application)
**Target Scale:** MVP + Growth Phase

---

## Overview

This document provides the complete epic and story breakdown for EWing (Friends Dictation Practice Website), decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

### Epic Structure Overview

**MVP Scope (Phase 1):**
- **Epic 1: Project Foundation & Authentication** - Establish technical infrastructure and user account system
- **Epic 2: Core Dictation Engine** - Build the heart of the application: video playback and dictation comparison
- **Epic 3: Vocabulary & Gamification** - Add engagement features: flashcards and progress tracking

**Post-MVP (Phase 2):**
- **Epic 4: Admin Content Management** - Create administrative tools for content management

Each epic represents a cohesive set of features that delivers clear business value and can be developed independently while building upon previous work.

---

<!-- Repeat for each epic (N = 1, 2, 3...) -->

## Epic 1: Project Foundation & Authentication

**Goal:** Establish the technical foundation for the application with a properly configured monorepo, database connectivity, and secure user authentication system. This epic creates the infrastructure that all subsequent features will build upon.

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story 1.1: Initialize Monorepo with Next.js and TypeScript

As a developer,
I want a properly structured monorepo with Next.js, TypeScript, and core tooling configured,
So that the team has a consistent, scalable foundation for building all features.

**Acceptance Criteria:**

**Given** a new project repository
**When** the initial setup is complete
**Then** the monorepo structure exists with pnpm workspaces configured

**And** Next.js 15 is installed in apps/web with TypeScript 5.x
**And** shared packages folder exists for common types and utilities
**And** ESLint and Prettier are configured for code consistency
**And** the development server runs successfully on localhost:3000

**Prerequisites:** None (first story)

**Technical Notes:** Use pnpm for package management, configure tsconfig for monorepo with path aliases, setup .env.example for environment variables

---

### Story 1.2: Configure PostgreSQL Database with Prisma ORM

As a developer,
I want PostgreSQL database configured with Prisma ORM,
So that the application can persist user data and content.

**Acceptance Criteria:**

**Given** the monorepo from Story 1.1
**When** database configuration is complete
**Then** Prisma is installed and configured in packages/database

**And** database schema includes initial User model
**And** connection to PostgreSQL (local or cloud) is verified
**And** prisma generate and prisma db push commands work
**And** a health check API endpoint (/api/health) confirms database connectivity

**Prerequisites:** Story 1.1 (monorepo structure)

**Technical Notes:** Use Vercel Postgres or Neon for cloud database, implement connection pooling, create database package that exports Prisma client

---

### Story 1.3: Implement User Registration Flow

As a new user,
I want to create an account with email and password,
So that my learning progress can be saved and accessed later.

**Acceptance Criteria:**

**Given** a visitor on the registration page
**When** they submit valid email and password
**Then** a new user account is created in the database

**And** password is hashed using bcrypt before storage
**And** appropriate validation errors show for invalid inputs
**And** duplicate email addresses are rejected with clear message
**And** successful registration redirects to login page

**Prerequisites:** Story 1.2 (database configured)

**Technical Notes:** Implement NextAuth.js 4.x with credentials provider, use Zod for validation, create reusable form components with React Hook Form

---

### Story 1.4: Implement User Login and Session Management

As a registered user,
I want to log in with my credentials and have my session maintained,
So that I can access personalized features without repeated authentication.

**Acceptance Criteria:**

**Given** a user with valid credentials
**When** they submit the login form
**Then** a secure session is created using NextAuth.js

**And** invalid credentials show appropriate error messages
**And** session persists across page refreshes
**And** protected routes redirect to login when unauthenticated
**And** logout functionality clears the session completely

**Prerequisites:** Story 1.3 (user registration)

**Technical Notes:** Configure JWT or database sessions in NextAuth, implement middleware for route protection, setup auth context with Zustand

---

### Story 1.5: Create Basic Dashboard Layout

As a logged-in user,
I want to see a dashboard after login,
So that I can navigate to different features of the application.

**Acceptance Criteria:**

**Given** an authenticated user
**When** they log in successfully
**Then** they are redirected to the dashboard page

**And** dashboard displays user's name/email
**And** navigation menu includes links for future features (placeholder)
**And** logout button is visible and functional
**And** responsive layout works on mobile and desktop

**Prerequisites:** Story 1.4 (login and sessions)

**Technical Notes:** Use Tailwind CSS for styling, create layout component with navigation, implement responsive design with mobile-first approach

<!-- End Epic 1 stories -->

---

## Epic 2: Core Dictation Engine

**Goal:** Build the heart of the application - the complete dictation learning loop. This includes video storage and streaming infrastructure, the video player interface, dictation input system, and the intelligent comparison engine with flexible word matching.

### Story 2.1: Set Up Video Storage Infrastructure with Cloudflare R2

As a developer,
I want video clips stored in Cloudflare R2 with CDN delivery configured,
So that videos can be efficiently streamed to users worldwide.

**Acceptance Criteria:**

**Given** the need for video storage
**When** the infrastructure is configured
**Then** Cloudflare R2 bucket is created and configured for public access

**And** CDN is properly configured for video delivery
**And** API endpoints can generate signed URLs for video access
**And** a sample 10-second clip can be uploaded and retrieved
**And** video metadata table is created in database (clip_id, filename, transcript, difficulty_words)

**Prerequisites:** Story 1.2 (database configured)

**Technical Notes:** Configure CORS for video streaming, implement presigned URLs if needed for security, create video service module in packages/shared

---

### Story 2.2: Create Video Clip Management API

As a developer,
I want API endpoints to manage video clips and their metadata,
So that the frontend can retrieve available clips and their associated data.

**Acceptance Criteria:**

**Given** video clips stored in R2 and metadata in database
**When** API endpoints are implemented
**Then** GET /api/clips returns paginated list of available clips

**And** GET /api/clips/[id] returns single clip with transcript and metadata
**And** clips include title, difficulty level, duration, thumbnail URL
**And** API follows the standard response format from PRD
**And** proper error handling for missing clips

**Prerequisites:** Story 2.1 (video storage infrastructure)

**Technical Notes:** Use TanStack Query for caching, implement pagination with cursor-based approach, include filtering by difficulty

---

### Story 2.3: Implement Video Player with Controls

As a logged-in user,
I want to watch 10-second video clips with playback controls,
So that I can listen to the dialogue multiple times before attempting dictation.

**Acceptance Criteria:**

**Given** a user selects a clip from the dashboard
**When** the learning interface loads
**Then** the video player displays with the selected clip

**And** play/pause button works correctly
**And** replay button restarts the video from beginning
**And** volume control is available
**And** video loads from CDN without buffering issues
**And** player is responsive on mobile and desktop

**Prerequisites:** Story 2.2 (video clip API), Story 1.5 (dashboard)

**Technical Notes:** Use react-player library, implement custom controls for consistent UI, add loading states and error handling

---

### Story 2.4: Build Dictation Input Interface

As a logged-in user,
I want to type what I hear in a text area,
So that I can practice my listening comprehension through active transcription.

**Acceptance Criteria:**

**Given** a video has been played at least once
**When** the user focuses on the input area
**Then** they can type their transcription

**And** text area auto-expands as user types
**And** character count is displayed (optional)
**And** "Check Answer" button appears when text is entered
**And** user can clear and retry their attempt
**And** keyboard shortcuts work (Enter to submit, etc.)

**Prerequisites:** Story 2.3 (video player)

**Technical Notes:** Use controlled component with React state, implement auto-save to localStorage, add accessibility features (ARIA labels)

---

### Story 2.5: Implement Flexible Word Matching Algorithm

As a developer,
I want a server-side algorithm that handles flexible word matching,
So that natural variations in speech (contractions, numbers) are properly recognized.

**Acceptance Criteria:**

**Given** user input and original transcript
**When** comparison is requested
**Then** the algorithm correctly matches common variations

**And** "gonna" matches "going to", "wanna" matches "want to"
**And** "2" matches "two", "10" matches "ten"
**And** case differences are ignored
**And** punctuation differences are handled gracefully
**And** algorithm runs server-side for security

**Prerequisites:** Story 2.4 (dictation input)

**Technical Notes:** Create comparison service in packages/shared, implement comprehensive test suite, consider using string similarity libraries

---

### Story 2.6: Create Visual Comparison Display

As a logged-in user,
I want to see a clear visual comparison of my transcription with the original,
So that I can identify my mistakes and learn from them.

**Acceptance Criteria:**

**Given** user submits their transcription
**When** the comparison is generated
**Then** both texts are displayed side by side or inline

**And** correct words are highlighted in green
**And** incorrect words are highlighted in red
**And** missing words are indicated clearly
**And** NO numerical score is displayed (per PRD requirement)
**And** user can proceed to next clip or retry current one

**Prerequisites:** Story 2.5 (matching algorithm)

**Technical Notes:** Use diff algorithm for word-level comparison, implement color-blind friendly alternatives, add animation for feedback

<!-- End Epic 2 stories -->

---

## Epic 3: Vocabulary & Gamification

**Goal:** Enhance the learning experience with personalized vocabulary tools and motivational features. This includes vocabulary warm-up before clips, interactive flashcard creation and review, and gamification elements to maintain user engagement and track progress.

### Story 3.1: Implement Vocabulary Warm-up Display

As a logged-in user,
I want to see difficult vocabulary before watching a clip,
So that I can prepare to listen for specific challenging words.

**Acceptance Criteria:**

**Given** a user selects a clip to practice
**When** the learning interface loads
**Then** a vocabulary warm-up overlay appears before the video

**And** overlay displays 3-5 difficult words from the upcoming clip
**And** each word shows its definition or context hint
**And** user must click "Start Practice" to dismiss overlay and begin
**And** warm-up words are stored in database per clip
**And** overlay has smooth animation and is mobile-friendly

**Prerequisites:** Story 2.3 (video player)

**Technical Notes:** Store difficulty words in video_clips table, create WarmupOverlay component, use Zustand for managing overlay state

---

### Story 3.2: Build Click-to-Create Flashcard System

As a logged-in user,
I want to click on any word in the comparison to save it as a flashcard,
So that I can easily build a personal vocabulary deck for later review.

**Acceptance Criteria:**

**Given** the comparison results are displayed
**When** user clicks on any word (correct or incorrect)
**Then** a popup appears with flashcard creation options

**And** popup shows the word and its context sentence
**And** user can add a personal note or translation
**And** clicking "Save" stores the flashcard to database
**And** visual feedback confirms successful save
**And** previously saved words show a saved indicator

**Prerequisites:** Story 2.6 (comparison display)

**Technical Notes:** Create user_flashcards table with userId, word, context, notes, implement FlashcardPopup component, use optimistic updates

---

### Story 3.3: Create Flashcard Review Page

As a logged-in user,
I want a dedicated page to review all my saved flashcards,
So that I can reinforce my vocabulary learning outside of dictation practice.

**Acceptance Criteria:**

**Given** user navigates to the Flashcard page
**When** the page loads
**Then** all user's saved flashcards are displayed

**And** flashcards show in a list or card view
**And** each card displays word, context, and personal notes
**And** user can filter by date added or alphabetically
**And** user can delete unwanted flashcards
**And** page is paginated if more than 20 flashcards

**Prerequisites:** Story 3.2 (flashcard creation)

**Technical Notes:** Create /flashcards route, implement FlashcardList component, use TanStack Query for data fetching and caching

---

### Story 3.4: Implement Progress Tracking System

As a logged-in user,
I want to see my total learning time and completion statistics,
So that I can track my improvement and stay motivated.

**Acceptance Criteria:**

**Given** user completes dictation exercises
**When** they return to the dashboard
**Then** progress metrics are displayed prominently

**And** total learning time is tracked (minutes spent in exercises)
**And** number of clips completed is shown
**And** average accuracy percentage is calculated (optional)
**And** progress data is stored in user_progress table
**And** metrics update in real-time after each exercise

**Prerequisites:** Story 2.6 (comparison display), Story 1.5 (dashboard)

**Technical Notes:** Create user_progress table, implement progress calculation service, add ProgressCard component to dashboard

---

### Story 3.5: Build Daily Streak Feature

As a logged-in user,
I want to see and maintain a daily learning streak,
So that I'm motivated to practice consistently every day.

**Acceptance Criteria:**

**Given** user practices at least one clip per day
**When** they complete their first clip of the day
**Then** their daily streak increments

**And** current streak number displays on dashboard
**And** longest streak record is maintained
**And** streak resets if user misses a day (midnight UTC)
**And** visual celebration appears when streak milestones reached (7, 30, 100 days)
**And** timezone handling ensures fair streak calculation

**Prerequisites:** Story 3.4 (progress tracking)

**Technical Notes:** Add streak fields to user_progress, implement streak calculation logic, create StreakDisplay component with animations

---

### Story 3.6: Add Practice History and Statistics

As a logged-in user,
I want to see my practice history and performance trends,
So that I can identify areas for improvement and track my progress over time.

**Acceptance Criteria:**

**Given** user has completed multiple dictation exercises
**When** they view their profile or statistics page
**Then** comprehensive practice history is displayed

**And** list of recently practiced clips with timestamps
**And** performance trend chart over last 30 days
**And** most common mistakes identified
**And** total words learned counter
**And** data exports as CSV (optional)

**Prerequisites:** Story 3.4 (progress tracking)

**Technical Notes:** Create user_attempts table for history, use chart library for visualizations, implement data aggregation queries

<!-- End Epic 3 stories -->

---

## Epic 4: Admin Content Management

**Goal:** Create administrative tools that allow non-technical users to manage video content, transcripts, and difficulty settings without code changes. This epic enables content scaling and maintenance.

### Story 4.1: Implement Admin Authentication and Authorization

As an administrator,
I want secure access to admin features with role-based permissions,
So that only authorized users can manage content.

**Acceptance Criteria:**

**Given** an admin user with proper credentials
**When** they access the admin portal
**Then** they are authenticated with enhanced security

**And** admin role is verified in database
**And** admin routes are protected with middleware
**And** regular users cannot access admin features
**And** admin session has shorter timeout for security
**And** all admin actions are logged for audit

**Prerequisites:** Story 1.4 (user authentication)

**Technical Notes:** Add role field to User model, implement admin middleware, create admin layout component, use RBAC pattern

---

### Story 4.2: Build Video Upload Interface

As an administrator,
I want to upload new 10-second video clips with metadata,
So that I can expand the content library without developer assistance.

**Acceptance Criteria:**

**Given** admin is on the content management page
**When** they upload a new video file
**Then** the video is processed and stored in Cloudflare R2

**And** file size and duration validation (max 10 seconds)
**And** video preview before final upload
**And** metadata form for title, season, episode
**And** progress indicator during upload
**And** success/error feedback after upload

**Prerequisites:** Story 4.1 (admin auth), Story 2.1 (video storage)

**Technical Notes:** Implement chunked upload for large files, use FFmpeg for validation, create upload progress tracking

---

### Story 4.3: Create Transcript Management System

As an administrator,
I want to add and edit transcripts for video clips,
So that accurate text is available for comparison.

**Acceptance Criteria:**

**Given** a video clip exists in the system
**When** admin edits its transcript
**Then** the transcript is saved and validated

**And** transcript editor with syntax highlighting
**And** timestamp synchronization tools
**And** bulk import from SRT/VTT files
**And** preview comparison mode
**And** version history for transcripts

**Prerequisites:** Story 4.2 (video upload)

**Technical Notes:** Create transcript editor component, implement SRT/VTT parser, add transcript validation service

---

### Story 4.4: Implement Difficulty Word Configuration

As an administrator,
I want to mark difficult words for each clip,
So that vocabulary warm-up features show relevant challenging words.

**Acceptance Criteria:**

**Given** a clip with transcript
**When** admin selects difficult words
**Then** those words are marked for warm-up display

**And** word selection interface on transcript
**And** difficulty level assignment (beginner/intermediate/advanced)
**And** definition/hint editor for each word
**And** bulk operations for common words
**And** preview of warm-up display

**Prerequisites:** Story 4.3 (transcript management)

**Technical Notes:** Add difficulty_words JSON field to video_clips, create word selection UI, implement difficulty analysis tools

---

### Story 4.5: Build Content Analytics Dashboard

As an administrator,
I want to see usage analytics for all content,
So that I can make data-driven decisions about content creation.

**Acceptance Criteria:**

**Given** users are practicing with clips
**When** admin views analytics dashboard
**Then** comprehensive usage statistics are displayed

**And** most/least practiced clips
**And** average completion rates per clip
**And** common error patterns by clip
**And** user engagement metrics
**And** content performance reports

**Prerequisites:** Story 4.1 (admin auth), Story 3.4 (progress tracking)

**Technical Notes:** Create analytics aggregation jobs, implement data visualization components, add export functionality

<!-- End Epic 4 stories -->

---

## Epic Breakdown Summary

### Coverage Validation

**All PRD Requirements Mapped:**
- ✅ FR1: Video hosting/streaming → Story 2.1, 2.2
- ✅ FR2: Video player → Story 2.3
- ✅ FR3: Dictation input → Story 2.4
- ✅ FR4: Comparison mechanism → Story 2.6
- ✅ FR5: Flexible word matching → Story 2.5
- ✅ FR6: Interactive flashcards → Stories 3.2, 3.3
- ✅ FR7: Vocabulary warm-up → Story 3.1
- ✅ FR8: Gamification → Stories 3.4, 3.5, 3.6
- ✅ FR9: User accounts → Stories 1.3, 1.4

**Non-Functional Requirements:**
- ✅ NFR1: Legal risk accepted (noted in documentation)
- ✅ NFR2: Online web application → Next.js on Vercel
- ✅ NFR3: Pre-processed clips → Story 2.1 (Cloudflare R2)
- ✅ NFR4: Server-side persistence → PostgreSQL with Prisma

### Story Count by Epic

| Epic | Story Count | Complexity |
|------|------------|------------|
| Epic 1: Foundation & Auth | 5 stories | Medium |
| Epic 2: Core Dictation | 6 stories | High |
| Epic 3: Vocabulary & Gamification | 6 stories | Medium |
| Epic 4: Admin CMS (Post-MVP) | 5 stories | Medium |
| **Total MVP Stories** | **17 stories** | - |
| **Total Project Stories** | **22 stories** | - |

### Implementation Sequencing

**Phase 1 - Foundation (Week 1-2):**
- Epic 1: Complete all 5 stories sequentially
- Establishes infrastructure for all subsequent work

**Phase 2 - Core Features (Week 3-4):**
- Epic 2: Complete all 6 stories sequentially
- Delivers the primary value proposition

**Phase 3 - Engagement (Week 5-6):**
- Epic 3: Complete all 6 stories sequentially
- Enhances retention and learning effectiveness

**Phase 4 - Post-MVP (Future):**
- Epic 4: Admin tools for content management
- Can be developed as needed after MVP launch

### Key Success Factors

1. **Foundation First:** Epic 1 must be completed entirely before starting Epic 2
2. **Vertical Slicing:** Each story delivers end-to-end functionality
3. **No Forward Dependencies:** Stories only depend on previously completed work
4. **Single-Session Sizing:** Each story is completable by one developer in one focused session
5. **BDD Acceptance Criteria:** Clear, testable success conditions for every story

### Next Steps

1. Use the `create-story` workflow to generate detailed implementation plans for each story
2. Run the `architecture` workflow to create technical architecture documentation
3. Begin Phase 1 implementation with Story 1.1: Initialize Monorepo

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._