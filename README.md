# Friends Dictation Practice Website

English language learning through 10-second Friends TV clips with dictation exercises.

## Project Structure

Monorepo using pnpm workspaces:
- `apps/web/` - Next.js 16 application
- `packages/shared/` - Shared types and utilities
- `packages/database/` - Database client and utilities
- `tests/` - Unit and E2E tests

## Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- PostgreSQL (for production)

## Setup

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Setup database (when configured)
pnpm prisma generate
pnpm prisma db push

# Start development server
pnpm dev
```

## Development Commands

```bash
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier
pnpm typecheck     # TypeScript checking
pnpm test          # Run unit tests
pnpm test:e2e      # Run E2E tests
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.x, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js, Prisma
- **Database**: PostgreSQL
- **State**: TanStack Query + Zustand
- **Testing**: Vitest + Playwright
- **Hosting**: Vercel

## Workspace Structure

This project uses pnpm workspaces for monorepo management:

```
friends-dictation/
├── apps/
│   └── web/                # Next.js application
├── packages/
│   ├── shared/             # Shared types and utilities
│   └── database/           # Database client and Prisma
├── tests/
│   ├── unit/               # Unit tests
│   └── e2e/                # End-to-end tests
├── pnpm-workspace.yaml     # Workspace configuration
└── package.json            # Root package scripts
```

## Development Workflow

1. **Working with packages**: Use workspace commands to run scripts in specific packages:
   ```bash
   pnpm --filter web dev        # Run dev in web app
   pnpm --filter shared build   # Build shared package
   pnpm -r lint                 # Run lint in all packages
   ```

2. **Adding dependencies**: Add dependencies to specific workspaces:
   ```bash
   pnpm --filter web add <package>        # Add to web app
   pnpm --filter shared add -D <package>  # Add dev dep to shared
   ```

3. **TypeScript paths**: Use configured aliases for imports:
   - `@/*` - Maps to src/ in web app
   - `@friends-dictation/shared` - Shared package
   - `@friends-dictation/database` - Database package

## Environment Variables

See `.env.example` for required environment variables:
- Database connection
- NextAuth.js configuration
- Cloudflare R2 storage settings

## Documentation

See `docs/` directory for detailed documentation:
- `docs/architecture.md` - Technical architecture and setup
- `docs/prd.md` - Product requirements document
- `docs/epics.md` - Epic and story breakdown

## License

Private project - All rights reserved