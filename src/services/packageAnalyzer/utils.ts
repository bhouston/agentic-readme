/**
 * Utility functions for the Package Analyzer service
 */

import { PrismaClient } from '@prisma/client';
import { AnalysisResult, StorageInfo } from './types';
import { storeAnalysisResults, storeLogOutput, storeReadme } from './storageManager';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Saves analysis results to the database
 * 
 * @param packageName - Package name
 * @param packageVersion - Package version
 * @param analysisResult - Analysis results
 * @param logOutput - Log output from the analysis
 * @returns Created or updated package version record
 */
export async function saveAnalysisResults(
  packageName: string,
  packageVersion: string,
  analysisResult: AnalysisResult,
  logOutput: string
): Promise<any> {
  // Store README in content-addressable storage if available
  let readmeStorageInfo: StorageInfo | undefined;
  if (analysisResult.readme) {
    readmeStorageInfo = await storeReadme(
      analysisResult.readme,
      packageName,
      packageVersion
    );
  }
  
  // Store analysis results in content-addressable storage
  const resultsStorageInfo = await storeAnalysisResults(
    analysisResult,
    packageName,
    packageVersion
  );
  
  // Store log output in content-addressable storage
  const logStorageInfo = await storeLogOutput(
    logOutput,
    packageName,
    packageVersion
  );
  
  // Find or create package in database
  const pkg = await prisma.package.upsert({
    where: { name: packageName },
    update: {
      description: analysisResult.packageInfo.description
    },
    create: {
      name: packageName,
      description: analysisResult.packageInfo.description
    }
  });
  
  // Find or create package version in database
  const packageVersion = await prisma.packageVersion.upsert({
    where: {
      packageId_version: {
        packageId: pkg.id,
        version: packageVersion
      }
    },
    update: {},
    create: {
      version: packageVersion,
      packageId: pkg.id
    }
  });
  
  // Create or update README record
  if (readmeStorageInfo) {
    const readme = await prisma.readme.upsert({
      where: { packageVersionId: packageVersion.id },
      update: {
        content: JSON.stringify(readmeStorageInfo), // Store reference to CAS
        verified: false
      },
      create: {
        packageVersionId: packageVersion.id,
        content: JSON.stringify(readmeStorageInfo), // Store reference to CAS
        verified: false
      }
    });
  }
  
  // Create verification record
  const verification = await prisma.verification.create({
    data: {
      packageVersionId: packageVersion.id,
      status: 'SUCCEEDED',
      results: {
        analysisResults: JSON.stringify(resultsStorageInfo), // Store reference to CAS
        logOutput: JSON.stringify(logStorageInfo) // Store reference to CAS
      }
    }
  });
  
  return packageVersion;
}

/**
 * Formats a log message with timestamp
 * 
 * @param message - Message to log
 * @returns Formatted log message
 */
export function formatLogMessage(message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${message}`;
}

/**
 * Validates a package name
 * 
 * @param packageName - Package name to validate
 * @returns True if valid, false otherwise
 */
export function isValidPackageName(packageName: string): boolean {
  // Basic validation for npm package names
  return /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(packageName);
}

/**
 * Validates a package version
 * 
 * @param version - Package version to validate
 * @returns True if valid, false otherwise
 */
export function isValidPackageVersion(version: string): boolean {
  // Basic validation for semantic versioning
  return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(version);
}