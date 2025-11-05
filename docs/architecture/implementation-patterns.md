# Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

## API Patterns

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

## Database Patterns

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

## Component Patterns

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
