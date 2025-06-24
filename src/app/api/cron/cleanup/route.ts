import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSecrets } from '@/server/jobs/cleanupExpiredSecrets';

/**
 * API route for cleaning up expired secrets
 * This can be called by cron services like Vercel Cron or other schedulers
 * 
 * For protection, you can add authentication checks here
 * by verifying a secret token in the request headers
 */
export async function GET(req: NextRequest) {
  // Check for secret token to protect the route
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];
  
  // Check for CRON_SECRET in environment variables and compare
  if (process.env.CRON_SECRET && (!token || token !== process.env.CRON_SECRET)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const result = await cleanupExpiredSecrets();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error running cleanup job:', error);
    
    return NextResponse.json(
      { error: 'Failed to run cleanup job' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
