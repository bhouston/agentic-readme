/**
 * Package Analyzer Module
 * 
 * This module is responsible for analyzing npm packages and generating README files.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as tar from 'tar';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import {
  AnalysisResult,
  NpmPackageInfo,
  StorageInfo,
  storeAnalysisResults,
  storeLogOutput,
  storeReadme,
  prisma
} from '@agentic-readme/shared';

const execAsync = promisify(exec);

/**
 * Fetches package information from npm registry
 * 
 * @param packageName - The name of the package to fetch
 * @param version - Optional specific version to fetch
 * @returns Package information from npm
 * @throws Error if package or version not found
 */
async function fetchPackageInfo(
  packageName: string,
  version?: string
): Promise<NpmPackageInfo> {
  try {
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    const response = await axios.get(url);
    
    if (version) {
      // Return specific version if requested
      if (!response.data.versions || !response.data.versions[version]) {
        throw new Error(`Version ${version} not found for package ${packageName}`);
      }
      
      return {
        ...response.data.versions[version],
        name: packageName,
      };
    } else {
      // Return latest version if no specific version requested
      const latestVersion = response.data['dist-tags']?.latest;
      if (!latestVersion || !response.data.versions || !response.data.versions[latestVersion]) {
        throw new Error(`Latest version not found for package ${packageName}`);
      }
      
      return {
        ...response.data.versions[latestVersion],
        name: packageName,
      };
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error(`Package ${packageName} not found`);
      }
      throw new Error(`Failed to fetch package: ${error.response.statusText}`);
    }
    throw error;
  }
}

/**
 * Analyzes a package and extracts relevant information
 * 
 * @param packageName - The name of the package to analyze
 * @param version - Optional specific version to analyze
 * @returns Analysis result containing package information and extracted data
 */
async function analyzePackage(
  packageName: string,
  version?: string
): Promise<any> {
  console.log(`Fetching package info for ${packageName}${version ? `@${version}` : ''}`);
  
  // Fetch package info
  const packageInfo = await fetchPackageInfo(packageName, version);
  
  console.log(`Analyzing package ${packageName}@${packageInfo.version}`);
  
  if (!packageInfo.dist?.tarball) {
    throw new Error(`No tarball URL found for package ${packageName}`);
  }

  // Create temporary directory for extraction
  const tempDir = await createTempDirectory();
  const logMessages: string[] = [];
  
  try {
    // Download and extract package
    console.log(`Downloading tarball from ${packageInfo.dist.tarball}`);
    const tarballData = await downloadPackageTarball(packageInfo.dist.tarball);
    
    console.log(`Extracting tarball to ${tempDir}`);
    await extractTarball(tarballData, tempDir);
    
    // Find package root directory (usually inside a 'package' folder)
    const packageRoot = await findPackageRoot(tempDir);
    
    // Run analysis using mycoder
    console.log(`Running analysis on ${packageName}@${packageInfo.version}`);
    const analysisResult = await runAnalysis(packageRoot, packageInfo);
    
    // Fetch existing README if available
    const existingReadme = await fetchPackageReadme(packageName, packageInfo.version);
    
    // Create final analysis result
    const result: AnalysisResult = {
      packageInfo,
      sourceFiles: analysisResult.sourceFiles || [],
      exports: analysisResult.exports || [],
      readme: existingReadme,
      hasExistingReadme: !!existingReadme
    };
    
    // Save analysis results
    await saveAnalysisResults(packageName, packageInfo.version, result, logMessages.join('\n'));
    
    return {
      packageName,
      version: packageInfo.version,
      hasReadme: !!existingReadme,
      exports: result.exports.length
    };
  } finally {
    // Clean up temporary directory
    await cleanupTempDirectory(tempDir);
  }
}

/**
 * Creates a temporary directory for package extraction
 * 
 * @returns Path to the created temporary directory
 */
async function createTempDirectory(): Promise<string> {
  const tempDir = path.join(os.tmpdir(), `npm-package-${Date.now()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Cleans up the temporary directory
 * 
 * @param tempDir - Path to the temporary directory
 */
async function cleanupTempDirectory(tempDir: string): Promise<void> {
  try {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to clean up temporary directory ${tempDir}:`, error);
  }
}

/**
 * Downloads the package tarball
 * 
 * @param tarballUrl - URL of the package tarball
 * @returns Buffer containing the tarball data
 * @throws Error if download fails
 */
async function downloadPackageTarball(tarballUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(tarballUrl, {
      responseType: 'arraybuffer'
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to download package tarball: ${error.response.statusText}`);
    }
    throw error;
  }
}

/**
 * Extracts a tarball to a directory
 * 
 * @param tarballData - Buffer containing the tarball data
 * @param extractDir - Directory to extract to
 */
async function extractTarball(tarballData: Buffer, extractDir: string): Promise<void> {
  // Write tarball to temporary file
  const tarballPath = path.join(extractDir, 'package.tgz');
  await fs.promises.writeFile(tarballPath, tarballData);
  
  // Extract tarball
  await tar.extract({
    file: tarballPath,
    cwd: extractDir
  });
  
  // Clean up tarball file
  await fs.promises.unlink(tarballPath);
}

/**
 * Finds the package root directory after extraction
 * 
 * @param extractDir - Directory where the package was extracted
 * @returns Path to the package root directory
 */
async function findPackageRoot(extractDir: string): Promise<string> {
  // Most npm tarballs extract to a 'package' directory
  const packageDir = path.join(extractDir, 'package');
  
  try {
    await fs.promises.access(packageDir);
    return packageDir;
  } catch {
    // If 'package' directory doesn't exist, use the extract directory
    return extractDir;
  }
}

/**
 * Runs analysis on the package using mycoder
 * 
 * @param packageRoot - Path to the package root directory
 * @param packageInfo - Package information from npm
 * @returns Analysis result
 */
async function runAnalysis(
  packageRoot: string,
  packageInfo: NpmPackageInfo
): Promise<any> {
  try {
    // Install mycoder in the temporary directory
    await execAsync('npm install mycoder --no-save', { cwd: packageRoot });
    
    // Create a simple script to extract exports
    const scriptPath = path.join(packageRoot, 'extract-exports.js');
    const scriptContent = `
      const mycoder = require('mycoder');
      const packageName = '${packageInfo.name}';
      
      async function extractExports() {
        try {
          const analysis = await mycoder.analyzePackage(packageName);
          console.log(JSON.stringify(analysis, null, 2));
        } catch (error) {
          console.error('Error analyzing package:', error);
          process.exit(1);
        }
      }
      
      extractExports();
    `;
    
    await fs.promises.writeFile(scriptPath, scriptContent);
    
    // Run the script
    const { stdout } = await execAsync(`node ${scriptPath}`, { cwd: packageRoot });
    
    // Parse the results
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error analyzing package:', error);
    return {
      sourceFiles: [],
      exports: []
    };
  }
}

/**
 * Fetches the README content for a package
 * 
 * @param packageName - The name of the package
 * @param version - Optional specific version
 * @returns README content if available, undefined otherwise
 */
async function fetchPackageReadme(
  packageName: string,
  version?: string
): Promise<string | undefined> {
  try {
    // First try to get the specific README from npm
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;
    const response = await axios.get(url);
    
    // If version is specified, get README for that version
    if (version && response.data.versions && response.data.versions[version]) {
      return response.data.versions[version].readme;
    }
    
    // Otherwise, try to get the latest README
    if (response.data.readme) {
      return response.data.readme;
    }
    
    return undefined;
  } catch (error) {
    // Don't throw for README fetch errors, just return undefined
    console.error(`Error fetching README for ${packageName}:`, error);
    return undefined;
  }
}

/**
 * Saves analysis results to the database
 * 
 * @param packageName - Package name
 * @param packageVersion - Package version
 * @param analysisResult - Analysis results
 * @param logOutput - Log output from the analysis
 * @returns Created or updated package version record
 */
async function saveAnalysisResults(
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
  const packageVersionRecord = await prisma.packageVersion.upsert({
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
      where: { packageVersionId: packageVersionRecord.id },
      update: {
        content: JSON.stringify(readmeStorageInfo), // Store reference to CAS
        verified: false
      },
      create: {
        packageVersionId: packageVersionRecord.id,
        content: JSON.stringify(readmeStorageInfo), // Store reference to CAS
        verified: false
      }
    });
  }
  
  // Create verification record
  const verification = await prisma.verification.create({
    data: {
      packageVersionId: packageVersionRecord.id,
      status: 'SUCCEEDED',
      results: {
        analysisResults: JSON.stringify(resultsStorageInfo), // Store reference to CAS
        logOutput: JSON.stringify(logStorageInfo) // Store reference to CAS
      }
    }
  });
  
  return packageVersionRecord;
}

export const packageAnalyzer = {
  analyzePackage,
  fetchPackageInfo
};
