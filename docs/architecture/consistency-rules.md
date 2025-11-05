# Consistency Rules

## Naming Conventions

**TypeScript:**
- Interfaces: Prefix with 'I' (`IUser`, `IClip`)
- Types: Direct naming (`ClipResponse`, `DictationResult`)
- Enums: PascalCase (`UserRole`, `ClipStatus`)

**State Management:**
- Zustand stores: `use{Domain}Store` (`useAuthStore`)
- TanStack Query keys: `[domain, action, ...params]`
  - Example: `['clips', 'list']`, `['user', 'progress', userId]`

## Code Organization

**Import Order:**
1. React/Next.js imports
2. Third-party libraries
3. Local aliases (`@/components`, `@/lib`)
4. Relative imports
5. Types/interfaces

**File Structure:**
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Main component/function
// 5. Helper functions
// 6. Exports
```

## Error Handling

**API Error Codes:**
- Format: `DOMAIN_ACTION_ERROR`
- Examples:
  - `AUTH_LOGIN_FAILED`
  - `CLIP_NOT_FOUND`
  - `DICTATION_COMPARISON_FAILED`

**Client-Side Error Handling:**
```typescript
try {
  const result = await fetchData();
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Retry with exponential backoff
  } else {
    // Show user-friendly error
  }
}
```

## Logging Strategy

**Development:**
- Console logging with structured format
- Log levels: debug, info, warn, error

**Production:**
- Vercel automatic logging
- Structured JSON format
- No sensitive data in logs
