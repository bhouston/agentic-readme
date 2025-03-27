/**
 * Types for the Package Analyzer service
 */

/**
 * Package information from npm
 */
export interface NpmPackageInfo {
  name: string;
  description?: string;
  version: string;
  license?: string;
  homepage?: string;
  repository?: {
    type: string;
    url: string;
  };
  author?: {
    name: string;
    email?: string;
    url?: string;
  } | string;
  maintainers?: Array<{
    name: string;
    email?: string;
  }>;
  keywords?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  main?: string;
  module?: string;
  types?: string;
  exports?: Record<string, string | Record<string, string>>;
  files?: string[];
  dist?: {
    tarball: string;
    shasum: string;
    integrity?: string;
  };
}

/**
 * Package version information
 */
export interface PackageVersionInfo {
  version: string;
  date: string;
}

/**
 * Source file information
 */
export interface SourceFileInfo {
  path: string;
  content: string;
  isExported: boolean;
}

/**
 * Exported item information
 */
export interface ExportedItem {
  name: string;
  kind: 'function' | 'class' | 'variable' | 'type' | 'interface' | 'enum' | 'namespace' | 'unknown';
  documentation?: string;
  signature?: string;
  examples?: string[];
}

/**
 * Analysis result
 */
export interface AnalysisResult {
  packageInfo: NpmPackageInfo;
  sourceFiles: SourceFileInfo[];
  exports: ExportedItem[];
  readme?: string;
  hasExistingReadme: boolean;
}

/**
 * Storage information for content addressable storage
 */
export interface StorageInfo {
  bucket: string;
  path: string;
  filename: string;
  contentHash: string;
  contentType: string;
  size: number;
}

/**
 * Analysis job status
 */
export enum AnalysisJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Analysis job information
 */
export interface AnalysisJobInfo {
  id: string;
  packageName: string;
  packageVersion: string;
  status: AnalysisJobStatus;
  startTime?: Date;
  endTime?: Date;
  error?: string;
  logStorageInfo?: StorageInfo;
  resultStorageInfo?: StorageInfo;
}