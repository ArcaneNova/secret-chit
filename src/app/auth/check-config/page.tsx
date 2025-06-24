import React from 'react';

export default async function AuthConfigCheckPage() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  // Fetch the verification result on the server side
  let verificationResult;
  try {
    const response = await fetch(`${baseUrl}/api/verify-auth-config`, { 
      cache: 'no-store' 
    });
    verificationResult = await response.json();
  } catch (error) {
    verificationResult = { 
      error: 'Failed to fetch verification result',
      message: error instanceof Error ? error.message : String(error)
    };
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Authentication Configuration Status</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Callback URLs</h2>
        <p className="mb-2"><strong>GitHub:</strong> {verificationResult?.callbackEndpoints?.github || 'Not configured'}</p>
        <p><strong>Google:</strong> {verificationResult?.callbackEndpoints?.google || 'Not configured'}</p>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Provider Configuration</h2>
        <p className="mb-2">
          <strong>GitHub:</strong> {verificationResult?.configuredProviders?.github 
            ? '✅ Credentials found in environment variables' 
            : '❌ Missing credentials'}
        </p>
        <p className="mb-2">
          <strong>Google:</strong> {verificationResult?.configuredProviders?.google 
            ? '✅ Credentials found in environment variables' 
            : '❌ Missing credentials'}
        </p>
        <p>
          <strong>Email:</strong> {verificationResult?.configuredProviders?.email 
            ? '✅ SMTP settings found in environment variables' 
            : '❌ Missing SMTP settings'}
        </p>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">API Check</h2>
        <p className="mb-2">
          <strong>Status:</strong> {verificationResult?.apiCheck?.status || 'Unknown'}
        </p>
        <p className="mb-2">
          <strong>Status Code:</strong> {verificationResult?.apiCheck?.statusCode || 'N/A'}
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2">Configured Providers</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(verificationResult?.apiCheck?.providersConfigured || {}, null, 2)}
        </pre>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Next Steps</h2>
        <p className="mb-2">
          When configuring your OAuth providers, add these callback URLs to your provider settings:
        </p>
        <ul className="list-disc list-inside ml-4">
          <li className="mb-1">GitHub: <code>{verificationResult?.callbackEndpoints?.github || '[NEXTAUTH_URL]/api/auth/callback/github'}</code></li>
          <li>Google: <code>{verificationResult?.callbackEndpoints?.google || '[NEXTAUTH_URL]/api/auth/callback/google'}</code></li>
        </ul>
      </div>
    </div>
  );
}
