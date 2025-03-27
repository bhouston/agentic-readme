/**
 * Storage Manager Service
 * 
 * This service is responsible for:
 * 1. Managing content-addressable storage in Google Cloud Storage
 * 2. Storing and retrieving README files and other artifacts
 * 3. Generating and managing content hashes
 */

import * as crypto from 'crypto';
import { Storage } from '@google-cloud/storage';
import { StorageInfo } from './types';

// Initialize Google Cloud Storage
const storage = new Storage();

// Default bucket name for content-addressable storage
const DEFAULT_BUCKET_NAME = process.env.GOOGLE_CLOUD_PROJECT 
  ? `${process.env.GOOGLE_CLOUD_PROJECT}-cas` 
  : 'agentic-readme-cas';

/**
 * Stores content in content-addressable storage
 * 
 * @param content - Content to store (string or Buffer)
 * @param extension - File extension (e.g., 'md', 'log', 'json')
 * @param contentType - MIME type of the content
 * @param bucketName - Optional custom bucket name
 * @returns Storage information for the stored content
 */
export async function storeContent(
  content: string | Buffer,
  extension: string,
  contentType: string,
  bucketName: string = DEFAULT_BUCKET_NAME
): Promise<StorageInfo> {
  // Convert string content to Buffer if needed
  const contentBuffer = typeof content === 'string' ? Buffer.from(content) : content;
  
  // Generate content hash using SHA-256
  const contentHash = generateContentHash(contentBuffer);
  
  // Create filename with hash and extension
  const filename = `${contentHash}.${extension}`;
  
  // Store in content-addressable storage path
  const path = 'cas';
  const fullPath = `${path}/${filename}`;
  
  // Get or create bucket
  const bucket = storage.bucket(bucketName);
  const exists = await bucket.exists();
  
  if (!exists[0]) {
    // Create bucket if it doesn't exist
    await bucket.create();
  }
  
  // Upload file
  const file = bucket.file(fullPath);
  await file.save(contentBuffer, {
    contentType,
    metadata: {
      contentHash,
      originalExtension: extension
    }
  });
  
  // Return storage information
  return {
    bucket: bucketName,
    path,
    filename,
    contentHash,
    contentType,
    size: contentBuffer.length
  };
}

/**
 * Retrieves content from content-addressable storage
 * 
 * @param storageInfo - Storage information for the content
 * @returns Content as a Buffer
 */
export async function retrieveContent(storageInfo: StorageInfo): Promise<Buffer> {
  const { bucket: bucketName, path, filename } = storageInfo;
  const fullPath = `${path}/${filename}`;
  
  // Get bucket and file
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fullPath);
  
  // Check if file exists
  const exists = await file.exists();
  if (!exists[0]) {
    throw new Error(`File not found: ${fullPath}`);
  }
  
  // Download file
  const [content] = await file.download();
  return content;
}

/**
 * Retrieves content from content-addressable storage as a string
 * 
 * @param storageInfo - Storage information for the content
 * @returns Content as a string
 */
export async function retrieveContentAsString(storageInfo: StorageInfo): Promise<string> {
  const content = await retrieveContent(storageInfo);
  return content.toString('utf8');
}

/**
 * Generates a content hash using SHA-256
 * 
 * @param content - Content to hash
 * @returns SHA-256 hash as a hex string
 */
export function generateContentHash(content: Buffer | string): string {
  const hash = crypto.createHash('sha256');
  hash.update(typeof content === 'string' ? Buffer.from(content) : content);
  return hash.digest('hex');
}

/**
 * Stores a README file in content-addressable storage
 * 
 * @param readme - README content
 * @param packageName - Package name
 * @param packageVersion - Package version
 * @returns Storage information for the README
 */
export async function storeReadme(
  readme: string,
  packageName: string,
  packageVersion: string
): Promise<StorageInfo> {
  return storeContent(
    readme,
    'md',
    'text/markdown',
    DEFAULT_BUCKET_NAME
  );
}

/**
 * Stores analysis results in content-addressable storage
 * 
 * @param results - Analysis results as a JSON object
 * @param packageName - Package name
 * @param packageVersion - Package version
 * @returns Storage information for the analysis results
 */
export async function storeAnalysisResults(
  results: any,
  packageName: string,
  packageVersion: string
): Promise<StorageInfo> {
  return storeContent(
    JSON.stringify(results, null, 2),
    'json',
    'application/json',
    DEFAULT_BUCKET_NAME
  );
}

/**
 * Stores log output in content-addressable storage
 * 
 * @param log - Log content
 * @param packageName - Package name
 * @param packageVersion - Package version
 * @returns Storage information for the log
 */
export async function storeLogOutput(
  log: string,
  packageName: string,
  packageVersion: string
): Promise<StorageInfo> {
  return storeContent(
    log,
    'log',
    'text/plain',
    DEFAULT_BUCKET_NAME
  );
}