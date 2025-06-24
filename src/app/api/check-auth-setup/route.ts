import { testCallbackEndpoint } from "@/app/api/test-callback";
import { NextResponse } from 'next/server';

// Simple API endpoint to verify the callback configuration
export async function GET() {
  const result = await testCallbackEndpoint();
  
  return NextResponse.json(result);
}
