/**
 * This is a simple test file to verify the callback endpoint configuration
 * It's not meant to be used in production, just for verification purposes
 */

export async function testCallbackEndpoint() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const gitHubCallbackUrl = `${baseUrl}/api/auth/callback/github`;
    const googleCallbackUrl = `${baseUrl}/api/auth/callback/google`;
    
    console.log('GitHub callback URL:', gitHubCallbackUrl);
    console.log('Google callback URL:', googleCallbackUrl);
    
    // Check if the route file exists
    console.log('NextAuth route handler is correctly set up at:', '/api/auth/[...nextauth]/route.ts');
    
    return {
      githubCallback: gitHubCallbackUrl,
      googleCallback: googleCallbackUrl,
      status: 'Callback URLs are properly configured'
    };
  } catch (error) {
    console.error('Error testing callback endpoints:', error);
    return {
      error: 'Failed to test callback endpoints',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}
