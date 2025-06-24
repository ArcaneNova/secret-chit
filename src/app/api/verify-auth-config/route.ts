import { NextResponse } from 'next/server';
import { testCallbackEndpoint } from '@/app/api/test-callback';

export async function GET() {
  try {
    // Test basic configuration
    const configTest = await testCallbackEndpoint();
    
    // Test if the API routes are actually responding
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // For security reasons, we're not actually calling external providers
    // Just checking if our NextAuth handler responds
    const nextAuthResponse = await fetch(`${baseUrl}/api/auth/providers`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });
    
    let providersData = {};
    let statusOk = false;
    
    try {
      providersData = await nextAuthResponse.json();
      statusOk = nextAuthResponse.ok;
    } catch (e) {
      providersData = { error: 'Failed to parse response' };
    }
    
    return NextResponse.json({
      configurationCheck: configTest,
      apiCheck: {
        status: statusOk ? 'NextAuth API is responding correctly' : 'NextAuth API response issue',
        statusCode: nextAuthResponse.status,
        providersConfigured: providersData,
      },
      callbackEndpoints: {
        github: `${baseUrl}/api/auth/callback/github`,
        google: `${baseUrl}/api/auth/callback/google`,
      },
      configuredProviders: {
        github: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
        google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        email: Boolean(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_SERVER_USER),
      }
    });
  } catch (error) {
    console.error('Error in verification endpoint:', error);
    return NextResponse.json({
      error: 'Failed to verify authentication setup',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
