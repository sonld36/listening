import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({ user: null });
  });

  describe('setUser', () => {
    it('should set user data', () => {
      const testUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      useAuthStore.getState().setUser(testUser);

      expect(useAuthStore.getState().user).toEqual(testUser);
    });

    it('should replace existing user', () => {
      const user1 = { id: 'user-1', email: 'user1@example.com' };
      const user2 = { id: 'user-2', email: 'user2@example.com' };

      useAuthStore.getState().setUser(user1);
      expect(useAuthStore.getState().user).toEqual(user1);

      useAuthStore.getState().setUser(user2);
      expect(useAuthStore.getState().user).toEqual(user2);
    });

    it('should accept null to clear user', () => {
      const testUser = { id: 'user-1', email: 'test@example.com' };

      useAuthStore.getState().setUser(testUser);
      expect(useAuthStore.getState().user).toEqual(testUser);

      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('should clear user data', () => {
      const testUser = { id: 'user-1', email: 'test@example.com' };

      useAuthStore.getState().setUser(testUser);
      expect(useAuthStore.getState().user).toEqual(testUser);

      useAuthStore.getState().clearUser();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should work when user is already null', () => {
      expect(useAuthStore.getState().user).toBeNull();

      useAuthStore.getState().clearUser();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user fields', () => {
      const testUser = { id: 'user-1', email: 'old@example.com' };

      useAuthStore.getState().setUser(testUser);

      useAuthStore.getState().updateUser({ email: 'new@example.com' });

      expect(useAuthStore.getState().user).toEqual({
        id: 'user-1',
        email: 'new@example.com',
      });
    });

    it('should not affect other fields when updating', () => {
      const testUser = { id: 'user-1', email: 'test@example.com' };

      useAuthStore.getState().setUser(testUser);

      useAuthStore.getState().updateUser({ email: 'updated@example.com' });

      const user = useAuthStore.getState().user;
      expect(user?.id).toBe('user-1');
      expect(user?.email).toBe('updated@example.com');
    });

    it('should do nothing when user is null', () => {
      expect(useAuthStore.getState().user).toBeNull();

      useAuthStore.getState().updateUser({ email: 'test@example.com' });

      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
