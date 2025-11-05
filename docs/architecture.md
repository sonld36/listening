# Architecture

## Executive Summary

This architecture document defines the technical implementation strategy for the Friends TV Show Dictation Practice Website. The system uses a modern Next.js 15 monorepo architecture with TypeScript, optimized for AI agent consistency and scalable development. The architecture prioritizes developer experience, type safety, and clear separation of concerns while ensuring multiple AI agents can work on the codebase without conflicts.

## Project Initialization

First implementation story should execute:
```bash
pnpm create next-app@latest friends-dictation --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

This establishes the base architecture with these decisions:
- TypeScript configuration for type safety
- Tailwind CSS for utility-first styling
- ESLint for code quality
- App Router for modern Next.js architecture
- src/ directory for organized code structure
- @/* import aliases for clean imports

After initialization, add:
```bash
pnpm add next-auth@4.24.13 @prisma/client prisma
pnpm add zustand @tanstack/react-query react-player
pnpm add date-fns zod @aws-sdk/client-s3
pnpm add -D @types/node vitest @playwright/test
```

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| Frontend Framework | Next.js | 15.x | All | App Router, RSC support, Vercel optimization |
| Language | TypeScript | 5.x | All | Type safety across monorepo |
| Styling | Tailwind CSS | 3.4.x | All | Utility-first, consistent design |
| Authentication | NextAuth.js | 4.24.13 | Epic 1 | Battle-tested, Prisma integration |
| Database | PostgreSQL (Vercel/Neon) | Latest | All | Serverless, scales to zero |
| ORM | Prisma | 5.x | All | Type-safe database access |
| Video Storage | Cloudflare R2 | Latest | Epic 1 | Cost-effective, CDN included |
| Video Player | react-player | Latest | Epic 1 | Simple API, customizable |
| Server State | TanStack Query | 5.x | All | Caching, background refetch |
| Client State | Zustand | 4.x | All | Lightweight, TypeScript-first |
| Testing | Vitest + Playwright | Latest | All | Fast unit tests, reliable E2E |
| Hosting | Vercel | Latest | All | Optimized for Next.js |
| Package Manager | pnpm | 8.x | All | Efficient monorepo support |

## Project Structure

```
friends-dictation/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
├── apps/
│   └── web/                          # Next.js application
│       ├── src/
│       │   ├── app/                  # App Router pages
│       │   │   ├── (auth)/
│       │   │   │   ├── login/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── signup/
│       │   │   │       └── page.tsx
│       │   │   ├── (app)/
│       │   │   │   ├── dashboard/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── learn/
│       │   │   │   │   └── [clipId]/
│       │   │   │   │       └── page.tsx
│       │   │   │   └── flashcards/
│       │   │   │       └── page.tsx
│       │   │   ├── api/
│       │   │   │   ├── auth/
│       │   │   │   │   └── [...nextauth]/
│       │   │   │   │       └── route.ts
│       │   │   │   ├── clips/
│       │   │   │   │   ├── route.ts
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── route.ts
│       │   │   │   ├── dictation/
│       │   │   │   │   └── compare/
│       │   │   │   │       └── route.ts
│       │   │   │   ├── flashcards/
│       │   │   │   │   └── route.ts
│       │   │   │   └── progress/
│       │   │   │       └── route.ts
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/
│       │   │   ├── ui/              # Shadcn/ui components
│       │   │   ├── auth/            # LoginForm, SignupForm
│       │   │   ├── video/           # VideoPlayer wrapper
│       │   │   ├── dictation/       # DictationInput, ComparisonResult
│       │   │   └── flashcards/      # FlashcardList, FlashcardItem
│       │   ├── hooks/                # Custom React hooks
│       │   │   ├── useAuth.ts
│       │   │   ├── useClips.ts
│       │   │   └── useFlashcards.ts
│       │   ├── stores/               # Zustand stores
│       │   │   ├── authStore.ts
│       │   │   ├── progressStore.ts
│       │   │   └── flashcardStore.ts
│       │   ├── services/             # API service functions
│       │   │   ├── clips.service.ts
│       │   │   └── dictation.service.ts
│       │   └── lib/                  # Utilities
│       │       ├── prisma.ts
│       │       └── r2-client.ts
│       ├── public/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── package.json
├── packages/
│   ├── shared/                       # Shared business logic
│   │   ├── src/
│   │   │   ├── text-matching/
│   │   │   │   ├── index.ts
│   │   │   │   └── flexible-match.ts
│   │   │   └── types/
│   │   │       ├── index.ts
│   │   │       └── models.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── database/                     # Database utilities
│       ├── src/
│       │   └── client.ts
│       └── package.json
├── tests/
│   ├── unit/
│   │   └── text-matching.test.ts
│   └── e2e/
│       └── learning-flow.spec.ts
├── .env.local
├── .env.example
├── .eslintrc.json
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

## Epic to Architecture Mapping

| Epic | Components | API Routes | Database Tables |
| ---- | ---------- | ---------- | --------------- |
| Epic 1: Foundation & Core Loop | `/app/(auth)/`, `/app/(app)/learn/`, `/components/video/`, `/components/dictation/` | `/api/auth/`, `/api/clips/`, `/api/dictation/` | `users`, `video_clips`, `clip_subtitles` |
| Epic 2: Flashcards & Gamification | `/app/(app)/flashcards/`, `/components/flashcards/`, `/stores/progressStore.ts` | `/api/flashcards/`, `/api/progress/` | `user_flashcards`, `user_progress`, `daily_streaks` |

## Technology Stack Details

### Core Technologies

**Frontend:**
- Next.js 15 with App Router for server-side rendering and optimal performance
- React 19 for UI components with Server Components support
- TypeScript 5.x for end-to-end type safety
- Tailwind CSS 3.4 for utility-first styling
- react-player for video playback with custom controls

**Backend:**
- Node.js runtime via Next.js API routes
- NextAuth.js 4.24.13 for authentication with email/password
- Prisma 5.x ORM for type-safe database operations
- PostgreSQL via Vercel Postgres (Neon integration)

**State Management:**
- TanStack Query v5 for server state (data fetching, caching)
- Zustand v4 for client state (UI state, user preferences)

**Infrastructure:**
- Vercel for hosting and serverless functions
- Cloudflare R2 for video storage with CDN
- GitHub Actions for CI/CD

### Integration Points

**Authentication Flow:**
```
Client → NextAuth.js → Prisma → PostgreSQL
```

**Video Streaming:**
```
Client → react-player → Cloudflare R2 CDN → Video Files
```

**Dictation Comparison:**
```
Client → API Route → Shared Package (text-matching) → Response
```

**Data Persistence:**
```
Client → TanStack Query → API Routes → Prisma → PostgreSQL
```

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### API Patterns

**Endpoint Naming:**
- Use plural nouns: `/api/clips`, `/api/flashcards`
- Use [id] for dynamic routes: `/api/clips/[id]`
- Actions as sub-routes: `/api/clips/[id]/play`

**Response Format:**
```typescript
// Success Response
interface SuccessResponse<T> {
  success: true;
  data: T;
}

// Error Response
interface ErrorResponse {
  success: false;
  error: {
    code: string;    // e.g., "AUTH_INVALID_CREDENTIALS"
    message: string; // User-friendly message
  };
}
```

### Database Patterns

**Naming Conventions:**
- Tables: snake_case plural (`video_clips`, `user_flashcards`)
- Columns: snake_case (`user_id`, `created_at`, `clip_url`)
- Foreign keys: `{table}_id` format (`user_id`, `clip_id`)

**Prisma Schema Example:**
```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  password_hash String
  created_at    DateTime       @default(now())
  updated_at    DateTime       @updatedAt
  flashcards    UserFlashcard[]
  progress      UserProgress[]
}
```

### Component Patterns

**File Organization:**
- Components: PascalCase (`VideoPlayer.tsx`)
- Folders: kebab-case (`video-player/`)
- Tests: Co-located (`VideoPlayer.test.tsx`)

**Component Structure:**
```typescript
// components/video/VideoPlayer.tsx
interface VideoPlayerProps {
  clipId: string;
  onComplete?: () => void;
}

export function VideoPlayer({ clipId, onComplete }: VideoPlayerProps) {
  // Implementation
}
```

## Consistency Rules

### Naming Conventions

**TypeScript:**
- Interfaces: Prefix with 'I' (`IUser`, `IClip`)
- Types: Direct naming (`ClipResponse`, `DictationResult`)
- Enums: PascalCase (`UserRole`, `ClipStatus`)

**State Management:**
- Zustand stores: `use{Domain}Store` (`useAuthStore`)
- TanStack Query keys: `[domain, action, ...params]`
  - Example: `['clips', 'list']`, `['user', 'progress', userId]`

### Code Organization

**Import Order:**
1. React/Next.js imports
2. Third-party libraries
3. Local aliases (`@/components`, `@/lib`)
4. Relative imports
5. Types/interfaces

**File Structure:**
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Main component/function
// 5. Helper functions
// 6. Exports
```

### Error Handling

**API Error Codes:**
- Format: `DOMAIN_ACTION_ERROR`
- Examples:
  - `AUTH_LOGIN_FAILED`
  - `CLIP_NOT_FOUND`
  - `DICTATION_COMPARISON_FAILED`

**Client-Side Error Handling:**
```typescript
try {
  const result = await fetchData();
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Retry with exponential backoff
  } else {
    // Show user-friendly error
  }
}
```

### Logging Strategy

**Development:**
- Console logging with structured format
- Log levels: debug, info, warn, error

**Production:**
- Vercel automatic logging
- Structured JSON format
- No sensitive data in logs

## Data Architecture

### Core Models

**User:**
- id (cuid)
- email (unique)
- password_hash
- created_at
- updated_at

**VideoClip:**
- id (cuid)
- title
- description
- clip_url (R2 URL)
- duration_seconds (always 10)
- difficulty_level
- subtitle_text

**UserFlashcard:**
- id (cuid)
- user_id (FK)
- word
- context_sentence
- clip_id (FK)
- created_at

**UserProgress:**
- id (cuid)
- user_id (FK)
- clip_id (FK)
- completed_at
- time_spent_seconds
- accuracy_percentage

**DailyStreak:**
- id (cuid)
- user_id (FK)
- date
- clips_completed
- total_time_seconds

### Relationships

```
User 1:N UserFlashcard
User 1:N UserProgress
User 1:N DailyStreak
VideoClip 1:N UserProgress
VideoClip 1:N UserFlashcard
```

## API Contracts

### Authentication

**POST /api/auth/signup**
```typescript
Request: {
  email: string;
  password: string;
}
Response: {
  success: true;
  data: { user: IUser; token: string; }
}
```

### Clips

**GET /api/clips**
```typescript
Response: {
  success: true;
  data: {
    clips: IClip[];
    total: number;
  }
}
```

### Dictation Comparison

**POST /api/dictation/compare**
```typescript
Request: {
  clipId: string;
  userInput: string;
}
Response: {
  success: true;
  data: {
    original: string;
    comparison: IComparisonResult[];
  }
}
```

## Security Architecture

### Authentication & Authorization
- NextAuth.js with JWT sessions
- Password hashing with bcrypt (12 rounds)
- Session expiry: 30 days
- Refresh token rotation

### Data Protection
- HTTPS everywhere (enforced by Vercel)
- Environment variables for secrets
- Prisma parameterized queries (SQL injection prevention)
- Input validation with Zod schemas

### API Security
- Rate limiting on auth endpoints (5 attempts/minute)
- CORS configured for production domain only
- API routes require authentication (except public clips list)

## Performance Considerations

### From NFRs
- Pre-processed video clips (10 seconds each)
- CDN delivery via Cloudflare for video content
- Database connection pooling via Neon
- Server-side caching with TanStack Query

### Optimization Strategies
- Lazy loading for video components
- Image optimization with Next.js Image
- Code splitting per route
- Prefetching next clips during playback
- Debounced autosave for progress

## Deployment Architecture

### Environments
- Development: Local with `.env.local`
- Staging: Vercel preview deployments
- Production: Vercel production deployment

### CI/CD Pipeline
```yaml
on: [push, pull_request]
jobs:
  - lint (ESLint)
  - typecheck (TypeScript)
  - test:unit (Vitest)
  - test:e2e (Playwright)
  - build (Next.js)
  - deploy (Vercel)
```

### Infrastructure
```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Browser   │────▶│    Vercel    │────▶│  PostgreSQL   │
└─────────────┘     │   (Next.js)  │     │    (Neon)     │
                    └──────────────┘     └───────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │ Cloudflare R2│
                    │  (Videos)    │
                    └──────────────┘
```

## Development Environment

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- PostgreSQL client (for local development)
- Git

### Setup Commands

```bash
# Clone repository
git clone <repository-url>
cd friends-dictation

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Setup database
pnpm prisma generate
pnpm prisma db push

# Seed database (optional)
pnpm prisma db seed

# Start development server
pnpm dev

# Run tests
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
```

## Architecture Decision Records (ADRs)

### ADR-001: Monorepo with pnpm Workspaces
**Decision:** Use monorepo structure with pnpm workspaces
**Rationale:** Enables code sharing between frontend and backend, especially for TypeScript types and text-matching logic

### ADR-002: NextAuth.js over Auth.js v5
**Decision:** Use stable NextAuth.js v4 instead of beta Auth.js v5
**Rationale:** Production stability more important than latest features for MVP

### ADR-003: Cloudflare R2 for Video Storage
**Decision:** Use Cloudflare R2 instead of AWS S3
**Rationale:** Cost-effective (10GB free), includes CDN, minimal configuration

### ADR-004: Server-Side Text Comparison
**Decision:** Implement flexible word matching logic server-side
**Rationale:** Ensures consistency, prevents client-side manipulation, easier to update

### ADR-005: TanStack Query + Zustand
**Decision:** Use TanStack Query for server state, Zustand for client state
**Rationale:** Clear separation of concerns, 70% smaller bundle than Redux, better DX

---

_Generated by BMAD Decision Architecture Workflow v1.3.2_
_Date: 2025-11-06_
_For: sonld_