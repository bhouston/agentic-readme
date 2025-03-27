import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { isValidPackageName, isValidPackageVersion } from '@/services/packageAnalyzer/utils';
import { fetchPackageInfo } from '@/services/packageAnalyzer/packageFetcher';

// Initialize Prisma client
const prisma = new PrismaClient();

// Schema for package request validation
const packageRequestSchema = z.object({
  name: z.string().min(1).max(214),
  version: z.string().optional(),
});

/**
 * GET handler to retrieve packages from the database
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Build query
    const query: any = {};
    if (name) {
      query.name = {
        contains: name,
        mode: 'insensitive'
      };
    }
    
    // Fetch packages from database
    const packages = await prisma.package.findMany({
      where: query,
      include: {
        versions: {
          include: {
            readme: true
          }
        }
      },
      take: limit,
      skip: offset,
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Format response
    const formattedPackages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      versions: pkg.versions.map(version => ({
        id: version.id,
        version: version.version,
        hasReadme: !!version.readme
      }))
    }));
    
    // Get total count for pagination
    const totalCount = await prisma.package.count({
      where: query
    });
    
    return NextResponse.json({
      packages: formattedPackages,
      pagination: {
        total: totalCount,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    
    return NextResponse.json({ 
      success: false,
      message: 'Failed to fetch packages',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * POST handler to request package analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = packageRequestSchema.parse(body);
    
    const { name: packageName, version } = validatedData;
    
    // Validate package name and version
    if (!isValidPackageName(packageName)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid package name'
      }, { status: 400 });
    }
    
    if (version && !isValidPackageVersion(version)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid package version'
      }, { status: 400 });
    }
    
    // Verify package exists on npm
    try {
      await fetchPackageInfo(packageName, version);
    } catch (error) {
      return NextResponse.json({ 
        success: false,
        message: error instanceof Error ? error.message : String(error)
      }, { status: 400 });
    }
    
    // Create a request in the database
    // In a production environment, this would trigger a Cloud Run Job
    const request = await prisma.request.create({
      data: {
        packageName,
        version,
        status: 'PENDING',
        // In a real implementation, this would be linked to an authenticated user
        userId: '00000000-0000-0000-0000-000000000000' // Placeholder user ID
      }
    });
    
    // Queue analysis job
    // For now, we'll just redirect to the analyze endpoint
    return NextResponse.json({
      success: true,
      message: `README generation for ${packageName}${version ? ` v${version}` : ''} has been queued.`,
      requestId: request.id,
      // Include instructions for triggering analysis
      next: {
        endpoint: `/api/packages/analyze`,
        method: 'POST',
        body: { packageName, version }
      }
    }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }
    
    console.error('Error creating package request:', error);
    
    return NextResponse.json({ 
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}