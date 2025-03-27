/**
 * Package Fetcher Service
 * 
 * This service is responsible for fetching npm package data from npmjs.com
 */

import axios from 'axios';
import { NpmPackageInfo, PackageVersionInfo } from './types';

/**
 * Base URL for npm registry API
 */
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

/**
 * Fetches package information from npm registry
 * 
 * @param packageName - The name of the package to fetch
 * @param version - Optional specific version to fetch
 * @returns Package information from npm
 * @throws Error if package or version not found
 */
export async function fetchPackageInfo(
  packageName: string,
  version?: string
): Promise<NpmPackageInfo> {
  try {
    const url = `${NPM_REGISTRY_URL}/${encodeURIComponent(packageName)}`;
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
 * Fetches all available versions for a package
 * 
 * @param packageName - The name of the package
 * @returns Array of version information objects
 * @throws Error if package not found
 */
export async function fetchPackageVersions(
  packageName: string
): Promise<PackageVersionInfo[]> {
  try {
    const url = `${NPM_REGISTRY_URL}/${encodeURIComponent(packageName)}`;
    const response = await axios.get(url);
    
    if (!response.data.versions || !response.data.time) {
      throw new Error(`Version information not found for package ${packageName}`);
    }
    
    // Convert versions and time objects into an array of version info
    const versions: PackageVersionInfo[] = Object.keys(response.data.versions)
      .filter(version => response.data.time[version]) // Only include versions with time info
      .map(version => ({
        version,
        date: response.data.time[version]
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
    
    return versions;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 404) {
        throw new Error(`Package ${packageName} not found`);
      }
      throw new Error(`Failed to fetch package versions: ${error.response.statusText}`);
    }
    throw error;
  }
}

/**
 * Downloads the package tarball
 * 
 * @param tarballUrl - URL of the package tarball
 * @returns Buffer containing the tarball data
 * @throws Error if download fails
 */
export async function downloadPackageTarball(tarballUrl: string): Promise<Buffer> {
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
 * Fetches the README content for a package
 * 
 * @param packageName - The name of the package
 * @param version - Optional specific version
 * @returns README content if available, undefined otherwise
 */
export async function fetchPackageReadme(
  packageName: string,
  version?: string
): Promise<string | undefined> {
  try {
    // First try to get the specific README from npm
    const url = `${NPM_REGISTRY_URL}/${encodeURIComponent(packageName)}`;
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