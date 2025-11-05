# Deployment Architecture

## Environments
- Development: Local with `.env.local`
- Staging: Vercel preview deployments
- Production: Vercel production deployment

## CI/CD Pipeline
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

## Infrastructure
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
