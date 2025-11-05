# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Friends Dictation Practice Website** - A full-stack web app for English language learning through dictation exercises using 10-second Friends TV clips. Currently in pre-implementation phase with complete architecture and requirements documentation. Uses BMad Method (BMM) AI-agent framework for development.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4
- **State Management**:
  - Client State: Zustand 4.x
  - Server State: TanStack Query (React Query) 5.x
- **Video Player**: react-player
- **Package Manager**: pnpm 8.x

### Backend
- **Runtime**: Node.js via Next.js API Routes (serverless)
- **Authentication**: NextAuth.js 4.24.13
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL (Vercel Postgres/Neon)
- **Video Storage**: Cloudflare R2 (with CDN)

### Infrastructure & DevOps
- **Hosting**: Vercel (optimized for Next.js)
- **CI/CD**: GitHub Actions
- **Testing**: Vitest (unit), Playwright (E2E)

## Architecture

Monorepo with pnpm workspaces:
- `apps/web/` - Next.js application
- `packages/shared/` - Shared types and utilities
- `packages/database/` - Prisma schema and migrations

## Development Commands

```bash
# Setup
pnpm install
pnpm prisma db push        # Create database schema
pnpm prisma generate        # Generate Prisma client

# Development
pnpm dev                    # Start dev server (localhost:3000)
pnpm build                  # Production build
pnpm test                   # Run unit tests
pnpm test:e2e              # Run E2E tests
pnpm lint                   # ESLint
pnpm typecheck             # TypeScript checking

# Database
pnpm prisma studio         # Prisma Studio GUI
pnpm prisma migrate dev    # Create migration
```

## High-Level Architecture

Key architecture decisions from `docs/architecture.md`:
- **Server-side text comparison** for secure, consistent flexible word matching (gonna→going to)
- **Cloudflare R2** for video storage with CDN delivery
- **TanStack Query + Zustand** for clear server/client state separation
- **Pre-processed 10-second clips** stored server-side, not real-time processing

## API Patterns

All API responses follow:
```typescript
{ success: true, data: T }  // Success
{ success: false, error: { code: string, message: string } }  // Error
```

Error codes: `DOMAIN_ACTION_ERROR` (e.g., `AUTH_LOGIN_FAILED`)

## Database Schema

Core tables (PostgreSQL via Prisma):
- `users` - Authentication and profiles
- `video_clips` - 10-second clip metadata with transcripts
- `user_flashcards` - User-created vocabulary
- `user_progress` - Learning statistics and daily streaks

## Naming Conventions

- **Components**: PascalCase (`VideoPlayer.tsx`)
- **Utilities**: camelCase (`formatTime.ts`)
- **API Routes**: kebab-case (`/api/auth/login`)
- **Database**: snake_case (`user_progress`, `created_at`)
- **Zustand stores**: `use{Domain}Store` (e.g., `useAuthStore`)
- **TanStack Query keys**: `[domain, action, ...params]`

## BMad Method Integration

This project uses BMad Method (BMM) - an AI-driven agile framework. Key agents:

- `/bmad:bmm:agents:dev` - Developer implementation
- `/bmad:bmm:agents:architect` - Architecture decisions
- `/bmad:bmm:workflows:dev-story` - Story implementation
- `/bmad:bmm:workflows:code-review` - Code review process

Complete BMM documentation in `bmad/` directory (34 workflows, 12 agents).

## Critical Implementation Requirements

### Dictation Matching Algorithm
Must handle flexible matching:
- Contractions: "gonna" = "going to", "wanna" = "want to"
- Numbers: "2" = "two"
- Case-insensitive, punctuation-agnostic
- Server-side comparison for security

### Video Handling
- Pre-processed 10-second clips in Cloudflare R2
- CDN delivery for performance
- react-player for playback
- VTT subtitle format

## Essential Documentation

- `docs/prd.md` - Product Requirements Document (Vietnamese)
- `docs/architecture.md` - Technical architecture and setup (560+ lines)
- `bmad/` - BMad Method framework with workflows and agents

## Key Constraints

1. **No scoring system** - Only feedback through text comparison
2. **Flexible matching required** - Must handle contractions (gonna→going to)
3. **Pre-processed clips** - 10-second videos stored server-side
4. **Online only** - Web application, no offline mode
5. **Server-side persistence** - All user data with account linkage
