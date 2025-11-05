# Development Environment

## Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher
- PostgreSQL client (for local development)
- Git

## Setup Commands

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
