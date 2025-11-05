# Technology Stack Details

## Core Technologies

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

## Integration Points

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
