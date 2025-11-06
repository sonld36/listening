import { describe, it, expect } from 'vitest';
import { loginSchema, signupSchema } from '@/lib/validation/auth.schema';

describe('Auth validation schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('should reject empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is required');
      }
    });

    it('should reject invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });

    it('should accept any password length (no minimum for login)', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '123',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('signupSchema', () => {
    it('should accept valid signup data', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase');
      }
    });

    it('should reject password without number', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Password',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number');
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Pass1',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });
  });
});
