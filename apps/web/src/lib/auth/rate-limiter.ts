/**
 * Simple in-memory rate limiter for login attempts
 *
 * Architecture requirement: 5 attempts per minute per IP
 *
 * NOTE: This is a basic implementation using in-memory storage.
 * For production with multiple server instances, consider:
 * - Upstash Rate Limit (Redis-based)
 * - Vercel KV
 * - Redis with sliding window algorithm
 */

interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

// In-memory store (will reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Check if an identifier (e.g., IP address or email) has exceeded rate limit
 * @param identifier - Unique identifier (IP address or email)
 * @returns Object with { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No previous attempts or window has expired
  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    rateLimitStore.set(identifier, {
      attempts: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt,
    };
  }

  // Within the time window
  if (entry.attempts < MAX_ATTEMPTS) {
    entry.attempts += 1;
    rateLimitStore.set(identifier, entry);

    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - entry.attempts,
      resetAt: entry.resetAt,
    };
  }

  // Rate limit exceeded
  return {
    allowed: false,
    remaining: 0,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clean up expired entries (call periodically to prevent memory leaks)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
