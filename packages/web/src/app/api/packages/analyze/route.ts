/**
 * API endpoint for triggering package analysis
 * 
 * POST /api/packages/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@agentic-readme/shared';

// Validate request body schema
const requestSchema = z.object({
  packageName: z.string().min(1),
  version: z.string().optional()
});

/**
 * POST handler for triggering package analysis
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
    
    // In a production environment, this would trigger a Google Cloud Run Job
    // For now, we'll just create a record in the database
    
    // Create or update package
    const pkg = await prisma.package.upsert({
      where: { name: packageName },
      update: {},
      create: {
        name: packageName
      }
    });
    
    // Create request record
    const request = await prisma.request.create({
      data: {
        packageName,
        version,
        status: 'PENDING',
        // In a real implementation, this would be linked to an authenticated user
        userId: '00000000-0000-0000-0000-000000000000' // Placeholder user ID
      }
    });
    
    // In a production environment, this would trigger a Google Cloud Run Job
    // Something like:
    /*
    const jobName = `analyze-${packageName}-${Date.now()}`;
    const job = await cloudRunJobs.createJob({
      name: jobName,
      image: 'gcr.io/agentic-readme/analyzer:latest',
      env: [
        { name: 'PACKAGE_NAME', value: packageName },
        { name: 'PACKAGE_VERSION', value: version || '' },
        { name: 'JOB_ID', value: request.id }
      ]
    });
    
    await cloudRunJobs.runJob({
      name: jobName
    });
    */
    
    return NextResponse.json({
      message: `Analysis job for ${packageName}${version ? ` v${version}` : ''} has been queued.`,
      requestId: request.id
    });
  } catch (error) {
    console.error('Error triggering package analysis:', error);
    
    return NextResponse.json(
      { error: 'Failed to trigger package analysis', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}