# Data Architecture

## Core Models

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

## Relationships

```
User 1:N UserFlashcard
User 1:N UserProgress
User 1:N DailyStreak
VideoClip 1:N UserProgress
VideoClip 1:N UserFlashcard
```
