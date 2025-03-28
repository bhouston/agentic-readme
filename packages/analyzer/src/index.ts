/**
 * Package Analyzer Job
 * 
 * This is the entry point for the package analyzer job that runs on Google Cloud Run Jobs.
 * It analyzes npm packages and generates README files.
 */

import { prisma } from '@agentic-readme/shared';
import { packageAnalyzer } from './packageAnalyzer';

/**
 * Main function that runs the package analyzer job
 */
async function main() {
  console.log('Starting package analyzer job');
  
  try {
    // Get job parameters from environment variables
    const packageName = process.env.PACKAGE_NAME;
    const packageVersion = process.env.PACKAGE_VERSION;
    const jobId = process.env.JOB_ID || `job-${Date.now()}`;
    
    if (!packageName) {
      throw new Error('PACKAGE_NAME environment variable is required');
    }
    
    console.log(`Analyzing package: ${packageName}${packageVersion ? `@${packageVersion}` : ''}`);
    
    // Run package analysis
    const result = await packageAnalyzer.analyzePackage(packageName, packageVersion);
    
    console.log(`Analysis completed for ${packageName}${packageVersion ? `@${packageVersion}` : ''}`);
    console.log(`Result: ${JSON.stringify(result, null, 2)}`);
    
    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error('Error in package analyzer job:', error);
    
    // Exit with error
    process.exit(1);
  } finally {
    // Disconnect from database
    await prisma.$disconnect();
  }
}

// Run the main function
main();