import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

// Schema for package request validation
const packageRequestSchema = z.object({
  name: z.string().min(1).max(214),
  version: z.string().optional(),
});

export async function GET() {
  // In a real implementation, this would fetch from the database
  return NextResponse.json({
    packages: [
      { name: 'react', versions: ['18.2.0', '18.1.0'] },
      { name: 'lodash', versions: ['4.17.21', '4.17.20'] },
    ]
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = packageRequestSchema.parse(body);
    
    // In a real implementation, this would:
    // 1. Create a record in the database
    // 2. Queue a job to generate the README
    
    return NextResponse.json({
      success: true,
      message: `README generation for ${validatedData.name}${validatedData.version ? ` v${validatedData.version}` : ''} has been queued.`,
      requestId: 'sample-request-id', // This would be a real ID in production
    }, { status: 202 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false,
      message: 'An unexpected error occurred'
    }, { status: 500 });
  }
}