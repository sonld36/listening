import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2 Client
 * S3-compatible storage client configured for Cloudflare R2
 * Uses singleton pattern to prevent multiple instances during development hot reloads
 */

// Environment variable validation
const requiredEnvVars = {
  accountId: process.env.R2_ACCOUNT_ID,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  bucketName: process.env.R2_BUCKET_NAME,
  publicUrl: process.env.R2_PUBLIC_URL,
};

function validateEnvironment() {
  const missing = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => `R2_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

  if (missing.length > 0) {
    throw new Error(
      `Missing required R2 environment variables: ${missing.join(', ')}\n` +
      'Please ensure all R2 configuration is set in .env.local'
    );
  }
}

// Validate environment on module load
validateEnvironment();

const R2_ENDPOINT = `https://${requiredEnvVars.accountId}.r2.cloudflarestorage.com`;

class R2Client {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = requiredEnvVars.bucketName!;
    this.publicUrl = requiredEnvVars.publicUrl!;

    this.client = new S3Client({
      region: 'auto', // R2 uses 'auto' as the region
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: requiredEnvVars.accessKeyId!,
        secretAccessKey: requiredEnvVars.secretAccessKey!,
      },
    });
  }

  /**
   * Upload a file to R2 bucket
   * @param file - File buffer to upload
   * @param key - Object key (filename) in the bucket
   * @param contentType - MIME type of the file
   * @returns Public URL of the uploaded file
   */
  async uploadFile(file: Buffer, key: string, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await this.client.send(command);

      // Return public CDN URL
      return `${this.publicUrl}/${key}`;
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a presigned URL for temporary access to a private object
   * @param key - Object key in the bucket
   * @param expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns Presigned URL
   */
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.client, command, { expiresIn });
      return presignedUrl;
    } catch (error) {
      console.error('R2 presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a file from R2 bucket
   * @param key - Object key to delete
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('R2 delete error:', error);
      throw new Error(`Failed to delete file from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test connection to R2 bucket
   * @returns True if connection is successful
   */
  async testConnection(): Promise<boolean> {
    try {
      const command = new HeadBucketCommand({
        Bucket: this.bucketName,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('R2 connection test failed:', error);
      return false;
    }
  }

  /**
   * Get public URL for a file
   * @param key - Object key in the bucket
   * @returns Public URL
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}

// Declare global type for singleton pattern
declare global {
  // eslint-disable-next-line no-var
  var r2Client: R2Client | undefined;
}

// Create singleton instance
const r2Client = globalThis.r2Client || new R2Client();

// In development, save to global object to prevent multiple instances during hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.r2Client = r2Client;
}

export default r2Client;
