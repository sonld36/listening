# Project Structure

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
