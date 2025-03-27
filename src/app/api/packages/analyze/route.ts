/**
 * API endpoint for package analysis
 * 
 * POST /api/packages/analyze
 * Triggers analysis of an npm package
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { fetchPackageInfo } from '@/services/packageAnalyzer/packageFetcher';
import { analyzePackage } from '@/services/packageAnalyzer/sourceAnalyzer';
import { saveAnalysisResults, isValidPackageName, isValidPackageVersion } from '@/services/packageAnalyzer/utils';

// Initialize Prisma client
const prisma = new PrismaClient();

// Validate request body schema
const requestSchema = z.object({
  packageName: z.string().min(1),
  version: z.string().optional()
});

/**
 * POST handler for package analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { packageName, version } = result.data;
    
    // Validate package name and version
    if (!isValidPackageName(packageName)) {
      return NextResponse.json(
        { error: 'Invalid package name' },
        { status: 400 }
      );
    }
    
    if (version && !isValidPackageVersion(version)) {
      return NextResponse.json(
        { error: 'Invalid package version' },
        { status: 400 }
      );
    }
    
    // Check if package already exists in database
    const existingPackage = await prisma.package.findUnique({
      where: { name: packageName },
      include: {
        versions: {
          where: version ? { version } : undefined,
          include: {
            readme: true
          }
        }
      }
    });
    
    // If package version already has a README, return it
    if (existingPackage && existingPackage.versions.length > 0 && existingPackage.versions[0].readme) {
      return NextResponse.json({
        message: 'Package already analyzed',
        packageId: existingPackage.id,
        packageVersionId: existingPackage.versions[0].id,
        readmeId: existingPackage.versions[0].readme.id
      });
    }
    
    // Fetch package info from npm
    const packageInfo = await fetchPackageInfo(packageName, version);
    
    // Start analysis in background
    // In a production environment, this would be a Cloud Run Job
    // For now, we'll run it directly
    const logMessages: string[] = [];
    
    // Log function that captures output
    const log = (message: string) => {
      console.log(message);
      logMessages.push(message);
    };
    
    log(`Starting analysis of ${packageName}@${packageInfo.version}`);
    
    try {
      // Analyze package
      const analysisResult = await analyzePackage(packageInfo);
      
      log(`Analysis completed for ${packageName}@${packageInfo.version}`);
      
      // Save analysis results to database
      const packageVersion = await saveAnalysisResults(
        packageName,
        packageInfo.version,
        analysisResult,
        logMessages.join('\n')
      );
      
      return NextResponse.json({
        message: 'Package analysis completed',
        packageName,
        version: packageInfo.version,
        packageVersionId: packageVersion.id
      });
    } catch (error) {
      log(`Error analyzing package: ${error instanceof Error ? error.message : String(error)}`);
      
      // Create failed verification record
      const pkg = await prisma.package.upsert({
        where: { name: packageName },
        update: {},
        create: {
          name: packageName,
          description: packageInfo.description
        }
      });
      
      const packageVersion = await prisma.packageVersion.upsert({
        where: {
          packageId_version: {
            packageId: pkg.id,
            version: packageInfo.version
          }
        },
        update: {},
        create: {
          version: packageInfo.version,
          packageId: pkg.id
        }
      });
      
      await prisma.verification.create({
        data: {
          packageVersionId: packageVersion.id,
          status: 'FAILED',
          results: {
            error: error instanceof Error ? error.message : String(error),
            logs: logMessages
          }
        }
      });
      
      throw error;
    }
  } catch (error) {
    console.error('Error in package analysis endpoint:', error);
    
    return NextResponse.json(
      { error: 'Failed to analyze package', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}