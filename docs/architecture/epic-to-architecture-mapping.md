# Epic to Architecture Mapping

| Epic | Components | API Routes | Database Tables |
| ---- | ---------- | ---------- | --------------- |
| Epic 1: Foundation & Core Loop | `/app/(auth)/`, `/app/(app)/learn/`, `/components/video/`, `/components/dictation/` | `/api/auth/`, `/api/clips/`, `/api/dictation/` | `users`, `video_clips`, `clip_subtitles` |
| Epic 2: Flashcards & Gamification | `/app/(app)/flashcards/`, `/components/flashcards/`, `/stores/progressStore.ts` | `/api/flashcards/`, `/api/progress/` | `user_flashcards`, `user_progress`, `daily_streaks` |
