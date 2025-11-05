# Decision Summary

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
