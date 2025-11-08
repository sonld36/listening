import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/clips/upload/route';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  default: {
    videoClip: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/r2-client', () => ({
  default: {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

describe('Video Upload API Endpoint', () => {
  let prisma: any;
  let r2Client: any;

  beforeEach(async () => {
    // Get mocked instances
    const prismaModule = await import('@/lib/prisma');
    const r2Module = await import('@/lib/r2-client');
    prisma = prismaModule.default;
    r2Client = r2Module.default;

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/clips/upload', () => {
    const createMockFormData = (overrides: any = {}) => {
      const defaultData = {
        file: new File(['test video content'], 'test.mp4', { type: 'video/mp4' }),
        title: 'Test Video Clip',
        description: 'A test video description',
        difficultyLevel: 'BEGINNER',
        subtitleText: 'This is a test subtitle',
        difficultyWords: JSON.stringify([{ word: 'test', definition: 'a trial' }]),
      };

      const data = { ...defaultData, ...overrides };
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      return formData;
    };

    const createMockRequest = (formData: FormData) => {
      return {
        formData: async () => formData,
      } as any;
    };

    it('should upload video successfully with all required fields', async () => {
      const mockCdnUrl = 'https://test-bucket.r2.dev/12345-abc.mp4';
      const mockVideoClip = {
        id: 'clip-123',
        title: 'Test Video Clip',
        description: 'A test video description',
        clipUrl: mockCdnUrl,
        durationSeconds: 10,
        difficultyLevel: 'BEGINNER',
        subtitleText: 'This is a test subtitle',
        difficultyWords: [{ word: 'test', definition: 'a trial' }],
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      };

      // Mock R2 upload success
      r2Client.uploadFile.mockResolvedValueOnce(mockCdnUrl);

      // Mock database create success
      prisma.videoClip.create.mockResolvedValueOnce(mockVideoClip);

      // Create request
      const formData = createMockFormData();
      const request = createMockRequest(formData);

      // Call endpoint
      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        success: true,
        data: {
          id: 'clip-123',
          title: 'Test Video Clip',
          clipUrl: mockCdnUrl,
          durationSeconds: 10,
        },
      });

      // Verify R2 upload was called
      expect(r2Client.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringMatching(/^\d+-[a-z0-9]+\.mp4$/),
        'video/mp4'
      );

      // Verify database create was called
      expect(prisma.videoClip.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Video Clip',
          clipUrl: mockCdnUrl,
          difficultyLevel: 'BEGINNER',
          subtitleText: 'This is a test subtitle',
        }),
      });
    });

    it('should return error when no file is provided', async () => {
      const formData = createMockFormData({ file: null });
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_MISSING_FILE',
          message: 'No video file provided',
        },
      });
    });

    it('should return error for invalid file type', async () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const formData = createMockFormData({ file: invalidFile });
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_INVALID_FORMAT',
          message: expect.stringContaining('Invalid file format'),
        },
      });
    });

    it('should return error when file exceeds size limit', async () => {
      // Create a file larger than 5MB
      const largeContent = new Uint8Array(6 * 1024 * 1024);
      const largeFile = new File([largeContent], 'large.mp4', { type: 'video/mp4' });
      const formData = createMockFormData({ file: largeFile });
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_FILE_TOO_LARGE',
          message: expect.stringContaining('exceeds maximum allowed size'),
        },
      });
    });

    it('should return error when title is missing', async () => {
      const formData = createMockFormData({ title: undefined });
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_INVALID_METADATA',
          message: 'Invalid metadata provided',
        },
      });
    });

    it('should return error when difficulty level is invalid', async () => {
      const formData = createMockFormData({ difficultyLevel: 'INVALID' });
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_INVALID_METADATA',
        },
      });
    });

    it('should return error when difficulty words JSON is invalid', async () => {
      const formData = createMockFormData({ difficultyWords: 'invalid json' });
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_INVALID_DIFFICULTY_WORDS',
          message: 'Invalid JSON format for difficulty words',
        },
      });
    });

    it('should handle R2 upload failure', async () => {
      const uploadError = new Error('R2 upload failed');
      r2Client.uploadFile.mockRejectedValueOnce(uploadError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const formData = createMockFormData();
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_STORAGE_FAILED',
          message: 'Failed to upload video to storage',
        },
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle database failure and cleanup R2 upload', async () => {
      const mockCdnUrl = 'https://test-bucket.r2.dev/12345-abc.mp4';

      // Mock R2 upload success
      r2Client.uploadFile.mockResolvedValueOnce(mockCdnUrl);

      // Mock database failure
      const dbError = new Error('Database connection lost');
      prisma.videoClip.create.mockRejectedValueOnce(dbError);

      // Mock delete success
      r2Client.deleteFile.mockResolvedValueOnce(undefined);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const formData = createMockFormData();
      const request = createMockRequest(formData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        success: false,
        error: {
          code: 'CLIP_UPLOAD_DATABASE_FAILED',
          message: 'Failed to save video metadata',
        },
      });

      // Verify cleanup was attempted
      expect(r2Client.deleteFile).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should accept webm files', async () => {
      const webmFile = new File(['content'], 'test.webm', { type: 'video/webm' });
      const formData = createMockFormData({ file: webmFile });
      const request = createMockRequest(formData);

      const mockCdnUrl = 'https://test-bucket.r2.dev/12345-abc.webm';
      r2Client.uploadFile.mockResolvedValueOnce(mockCdnUrl);
      prisma.videoClip.create.mockResolvedValueOnce({
        id: 'clip-123',
        clipUrl: mockCdnUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(r2Client.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.stringMatching(/\.webm$/),
        'video/webm'
      );
    });
  });
});
