import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK modules
vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');

// Mock environment variables
const mockEnv = {
  R2_ACCOUNT_ID: 'test-account-id',
  R2_ACCESS_KEY_ID: 'test-access-key',
  R2_SECRET_ACCESS_KEY: 'test-secret-key',
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'https://test-bucket.r2.dev',
};

describe('R2 Client', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let mockS3Client: any;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;

    // Set mock environment variables
    process.env = { ...originalEnv, ...mockEnv };

    // Clear module cache to reload with new env vars
    vi.resetModules();

    // Mock S3Client
    mockS3Client = {
      send: vi.fn(),
    };
    vi.mocked(S3Client).mockImplementation(() => mockS3Client);

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should throw error when R2_ACCOUNT_ID is missing', async () => {
      delete process.env.R2_ACCOUNT_ID;
      vi.resetModules();

      await expect(async () => {
        await import('@/lib/r2-client');
      }).rejects.toThrow(/Missing required R2 environment variables.*R2_ACCOUNT_ID/);
    });

    it('should throw error when R2_ACCESS_KEY_ID is missing', async () => {
      delete process.env.R2_ACCESS_KEY_ID;
      vi.resetModules();

      await expect(async () => {
        await import('@/lib/r2-client');
      }).rejects.toThrow(/Missing required R2 environment variables.*R2_ACCESS_KEY_ID/);
    });

    it('should throw error when R2_SECRET_ACCESS_KEY is missing', async () => {
      delete process.env.R2_SECRET_ACCESS_KEY;
      vi.resetModules();

      await expect(async () => {
        await import('@/lib/r2-client');
      }).rejects.toThrow(/Missing required R2 environment variables.*R2_SECRET_ACCESS_KEY/);
    });

    it('should throw error when R2_BUCKET_NAME is missing', async () => {
      delete process.env.R2_BUCKET_NAME;
      vi.resetModules();

      await expect(async () => {
        await import('@/lib/r2-client');
      }).rejects.toThrow(/Missing required R2 environment variables.*R2_BUCKET_NAME/);
    });

    it('should initialize successfully with all environment variables', async () => {
      const r2Module = await import('@/lib/r2-client');
      expect(r2Module.default).toBeDefined();
      expect(S3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'auto',
          endpoint: `https://${mockEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: mockEnv.R2_ACCESS_KEY_ID,
            secretAccessKey: mockEnv.R2_SECRET_ACCESS_KEY,
          },
        })
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully and return public URL', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      // Mock successful upload
      mockS3Client.send.mockResolvedValueOnce({});

      const testBuffer = Buffer.from('test video content');
      const testKey = 'test-video.mp4';
      const testContentType = 'video/mp4';

      const result = await r2Client.uploadFile(testBuffer, testKey, testContentType);

      // Verify upload was called with correct parameters
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: mockEnv.R2_BUCKET_NAME,
            Key: testKey,
            Body: testBuffer,
            ContentType: testContentType,
          }),
        })
      );

      // Verify public URL is returned
      expect(result).toBe(`${mockEnv.R2_PUBLIC_URL}/${testKey}`);
    });

    it('should throw error when upload fails', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      // Mock upload failure
      const uploadError = new Error('S3 upload failed');
      mockS3Client.send.mockRejectedValueOnce(uploadError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const testBuffer = Buffer.from('test content');
      const testKey = 'test.mp4';
      const testContentType = 'video/mp4';

      await expect(
        r2Client.uploadFile(testBuffer, testKey, testContentType)
      ).rejects.toThrow('Failed to upload file to R2: S3 upload failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('R2 upload error:', uploadError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('generatePresignedUrl', () => {
    it('should generate presigned URL successfully', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      const mockPresignedUrl = 'https://test-bucket.r2.dev/test.mp4?signature=xyz';
      vi.mocked(getSignedUrl).mockResolvedValueOnce(mockPresignedUrl);

      const testKey = 'test-video.mp4';
      const result = await r2Client.generatePresignedUrl(testKey);

      // Verify getSignedUrl was called
      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(Object), // S3 client
        expect.any(Object), // Command
        expect.objectContaining({ expiresIn: 3600 }) // Default 1 hour
      );

      expect(result).toBe(mockPresignedUrl);
    });

    it('should generate presigned URL with custom expiration', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      const mockPresignedUrl = 'https://test-bucket.r2.dev/test.mp4?signature=abc';
      vi.mocked(getSignedUrl).mockResolvedValueOnce(mockPresignedUrl);

      const testKey = 'test-video.mp4';
      const customExpiry = 7200; // 2 hours

      await r2Client.generatePresignedUrl(testKey, customExpiry);

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({ expiresIn: customExpiry })
      );
    });

    it('should throw error when presigned URL generation fails', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      const signError = new Error('Signing failed');
      vi.mocked(getSignedUrl).mockRejectedValueOnce(signError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        r2Client.generatePresignedUrl('test.mp4')
      ).rejects.toThrow('Failed to generate presigned URL: Signing failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('R2 presigned URL error:', signError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      mockS3Client.send.mockResolvedValueOnce({});

      const testKey = 'test-video.mp4';
      await r2Client.deleteFile(testKey);

      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: mockEnv.R2_BUCKET_NAME,
            Key: testKey,
          }),
        })
      );
    });

    it('should throw error when delete fails', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      const deleteError = new Error('Delete operation failed');
      mockS3Client.send.mockRejectedValueOnce(deleteError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        r2Client.deleteFile('test.mp4')
      ).rejects.toThrow('Failed to delete file from R2: Delete operation failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('R2 delete error:', deleteError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('testConnection', () => {
    it('should return true when connection succeeds', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      mockS3Client.send.mockResolvedValueOnce({});

      const result = await r2Client.testConnection();

      expect(result).toBe(true);
      expect(mockS3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: mockEnv.R2_BUCKET_NAME,
          }),
        })
      );
    });

    it('should return false when connection fails', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      mockS3Client.send.mockRejectedValueOnce(new Error('Connection failed'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await r2Client.testConnection();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'R2 connection test failed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getPublicUrl', () => {
    it('should return correct public URL', async () => {
      const r2Module = await import('@/lib/r2-client');
      const r2Client = r2Module.default;

      const testKey = 'videos/test-clip.mp4';
      const result = r2Client.getPublicUrl(testKey);

      expect(result).toBe(`${mockEnv.R2_PUBLIC_URL}/${testKey}`);
    });
  });
});
