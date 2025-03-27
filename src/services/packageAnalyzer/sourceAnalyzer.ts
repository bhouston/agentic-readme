/**
 * Source Analyzer Service
 * 
 * This service is responsible for:
 * 1. Extracting and parsing source files from package tarballs
 * 2. Analyzing JavaScript/TypeScript code to extract key information
 * 3. Identifying exports, types, and other important API elements
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as tar from 'tar';
import { exec } from 'child_process';
import { promisify } from 'util';
import { AnalysisResult, ExportedItem, NpmPackageInfo, SourceFileInfo } from './types';
import { downloadPackageTarball, fetchPackageReadme } from './packageFetcher';

const execAsync = promisify(exec);

/**
 * Analyzes a package and extracts relevant information
 * 
 * @param packageInfo - Package information from npm
 * @returns Analysis result containing package information and extracted data
 */
export async function analyzePackage(packageInfo: NpmPackageInfo): Promise<AnalysisResult> {
  if (!packageInfo.dist?.tarball) {
    throw new Error(`No tarball URL found for package ${packageInfo.name}`);
  }

  // Create temporary directory for extraction
  const tempDir = await createTempDirectory();
  
  try {
    // Download and extract package
    const tarballData = await downloadPackageTarball(packageInfo.dist.tarball);
    await extractTarball(tarballData, tempDir);
    
    // Find package root directory (usually inside a 'package' folder)
    const packageRoot = await findPackageRoot(tempDir);
    
    // Find and parse source files
    const sourceFiles = await findSourceFiles(packageRoot, packageInfo);
    
    // Extract exports
    const exports = await extractExports(packageRoot, packageInfo, sourceFiles);
    
    // Fetch existing README if available
    const existingReadme = await fetchPackageReadme(packageInfo.name, packageInfo.version);
    
    return {
      packageInfo,
      sourceFiles,
      exports,
      readme: existingReadme,
      hasExistingReadme: !!existingReadme
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
 * Finds and reads source files from the package
 * 
 * @param packageRoot - Path to the package root directory
 * @param packageInfo - Package information from npm
 * @returns Array of source file information
 */
async function findSourceFiles(
  packageRoot: string,
  packageInfo: NpmPackageInfo
): Promise<SourceFileInfo[]> {
  const sourceFiles: SourceFileInfo[] = [];
  
  // Determine main source files from package.json
  const mainFiles = [
    packageInfo.main,
    packageInfo.module,
    packageInfo.types,
    'index.js',
    'index.ts',
    'index.d.ts'
  ].filter(Boolean) as string[];
  
  // Process main files
  for (const mainFile of mainFiles) {
    const filePath = path.join(packageRoot, mainFile);
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      sourceFiles.push({
        path: mainFile,
        content,
        isExported: true
      });
    } catch (error) {
      // Skip files that don't exist
      continue;
    }
  }
  
  // Find additional source files
  const fileExtensions = ['.js', '.ts', '.jsx', '.tsx', '.d.ts'];
  const excludeDirs = ['node_modules', 'test', 'tests', 'example', 'examples', 'dist', 'build'];
  
  await findSourceFilesRecursive(packageRoot, '', fileExtensions, excludeDirs, sourceFiles);
  
  return sourceFiles;
}

/**
 * Recursively finds source files in a directory
 * 
 * @param baseDir - Base directory path
 * @param relativePath - Relative path from base directory
 * @param extensions - Array of file extensions to include
 * @param excludeDirs - Array of directory names to exclude
 * @param sourceFiles - Array to add found source files to
 */
async function findSourceFilesRecursive(
  baseDir: string,
  relativePath: string,
  extensions: string[],
  excludeDirs: string[],
  sourceFiles: SourceFileInfo[]
): Promise<void> {
  const currentDir = path.join(baseDir, relativePath);
  
  try {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryRelativePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip excluded directories
        if (excludeDirs.includes(entry.name)) {
          continue;
        }
        
        // Recursively process subdirectory
        await findSourceFilesRecursive(
          baseDir,
          entryRelativePath,
          extensions,
          excludeDirs,
          sourceFiles
        );
      } else if (entry.isFile()) {
        // Check if file has a relevant extension
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          try {
            const content = await fs.promises.readFile(
              path.join(baseDir, entryRelativePath),
              'utf8'
            );
            
            // Check if file is already in sourceFiles
            const existingIndex = sourceFiles.findIndex(sf => sf.path === entryRelativePath);
            if (existingIndex === -1) {
              sourceFiles.push({
                path: entryRelativePath,
                content,
                isExported: false // Will be determined later
              });
            }
          } catch (error) {
            console.error(`Error reading file ${entryRelativePath}:`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${currentDir}:`, error);
  }
}

/**
 * Extracts exports from source files using the mycoder package
 * 
 * @param packageRoot - Path to the package root directory
 * @param packageInfo - Package information from npm
 * @param sourceFiles - Array of source file information
 * @returns Array of exported items
 */
async function extractExports(
  packageRoot: string,
  packageInfo: NpmPackageInfo,
  sourceFiles: SourceFileInfo[]
): Promise<ExportedItem[]> {
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
    const analysis = JSON.parse(stdout);
    
    // Convert to our ExportedItem format
    const exports: ExportedItem[] = [];
    
    if (analysis.exports) {
      for (const exp of analysis.exports) {
        exports.push({
          name: exp.name,
          kind: exp.kind || 'unknown',
          documentation: exp.documentation,
          signature: exp.signature,
          examples: exp.examples
        });
      }
    }
    
    return exports;
  } catch (error) {
    console.error('Error extracting exports:', error);
    
    // Fallback to basic export extraction if mycoder fails
    return extractExportsBasic(sourceFiles);
  }
}

/**
 * Basic export extraction from source files using regex
 * This is a fallback method if mycoder analysis fails
 * 
 * @param sourceFiles - Array of source file information
 * @returns Array of exported items
 */
function extractExportsBasic(sourceFiles: SourceFileInfo[]): ExportedItem[] {
  const exports: ExportedItem[] = [];
  
  // Simple regex patterns for detecting exports
  const patterns = [
    // ES6 exports
    { regex: /export\s+(const|let|var|function|class|interface|type|enum)\s+(\w+)/g, kind: 'variable' },
    // CommonJS exports
    { regex: /module\.exports\s*=\s*{([^}]*)}/g, kind: 'object' },
    { regex: /exports\.(\w+)\s*=/g, kind: 'property' }
  ];
  
  for (const file of sourceFiles) {
    for (const pattern of patterns) {
      const matches = file.content.matchAll(pattern.regex);
      for (const match of matches) {
        if (pattern.kind === 'variable') {
          // For ES6 exports, the name is in the second capture group
          const kind = match[1] as 'function' | 'class' | 'variable' | 'type' | 'interface' | 'enum' | 'namespace' | 'unknown';
          const name = match[2];
          
          exports.push({
            name,
            kind: kind === 'const' || kind === 'let' || kind === 'var' ? 'variable' : kind
          });
        } else if (pattern.kind === 'object' && match[1]) {
          // For CommonJS module.exports = { ... }, split the properties
          const properties = match[1].split(',');
          for (const prop of properties) {
            const propMatch = prop.trim().match(/(\w+)(?:\s*:\s*([^,]*))?/);
            if (propMatch && propMatch[1]) {
              exports.push({
                name: propMatch[1],
                kind: 'unknown'
              });
            }
          }
        } else if (pattern.kind === 'property' && match[1]) {
          // For CommonJS exports.property = ...
          exports.push({
            name: match[1],
            kind: 'unknown'
          });
        }
      }
    }
  }
  
  // Remove duplicates
  return exports.filter((export1, index, self) => 
    index === self.findIndex(export2 => export2.name === export1.name)
  );
}