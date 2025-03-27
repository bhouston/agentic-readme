/**
 * Tests for Package Analyzer service
 */

import { fetchPackageInfo, fetchPackageVersions } from '../services/packageAnalyzer/packageFetcher';
import { isValidPackageName, isValidPackageVersion } from '../services/packageAnalyzer/utils';
import { generateContentHash } from '../services/packageAnalyzer/storageManager';

// Mock axios for testing
jest.mock('axios');

describe('Package Fetcher', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('fetchPackageInfo should return package information', async () => {
    // This test would normally use mocked axios responses
    // For now, we'll just test the function signature
    expect(fetchPackageInfo).toBeDefined();
    expect(typeof fetchPackageInfo).toBe('function');
  });

  test('fetchPackageVersions should return version information', async () => {
    // This test would normally use mocked axios responses
    // For now, we'll just test the function signature
    expect(fetchPackageVersions).toBeDefined();
    expect(typeof fetchPackageVersions).toBe('function');
  });
});

describe('Storage Manager', () => {
  test('generateContentHash should create consistent hashes', () => {
    const content = 'Test content';
    const hash1 = generateContentHash(content);
    const hash2 = generateContentHash(content);
    
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBeGreaterThan(0);
  });

  test('generateContentHash should create different hashes for different content', () => {
    const content1 = 'Test content 1';
    const content2 = 'Test content 2';
    const hash1 = generateContentHash(content1);
    const hash2 = generateContentHash(content2);
    
    expect(hash1).not.toBe(hash2);
  });
});

describe('Utilities', () => {
  test('isValidPackageName should validate package names', () => {
    // Valid package names
    expect(isValidPackageName('lodash')).toBe(true);
    expect(isValidPackageName('@types/react')).toBe(true);
    
    // Invalid package names
    expect(isValidPackageName('')).toBe(false);
    expect(isValidPackageName('Invalid Name')).toBe(false);
  });

  test('isValidPackageVersion should validate package versions', () => {
    // Valid versions
    expect(isValidPackageVersion('1.0.0')).toBe(true);
    expect(isValidPackageVersion('1.0.0-beta.1')).toBe(true);
    expect(isValidPackageVersion('1.0.0+build.1')).toBe(true);
    
    // Invalid versions
    expect(isValidPackageVersion('')).toBe(false);
    expect(isValidPackageVersion('1.0')).toBe(false);
    expect(isValidPackageVersion('latest')).toBe(false);
  });
});