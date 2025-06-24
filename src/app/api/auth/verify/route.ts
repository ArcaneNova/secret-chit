import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';

export async function GET(request: Request) {
  // This is a special helper route to debug and fix email verification issues
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  if (!token || !email) {
    redirect('/auth/debug?error=missing_params');
  }
  
  try {
    // Check if the token exists
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!verificationToken) {
      console.error('Verification token not found in database');
      redirect('/auth/debug?error=token_not_found&email=' + encodeURIComponent(email));
    }
    
    if (verificationToken.expires < new Date()) {
      console.error('Verification token has expired');
      redirect('/auth/debug?error=token_expired&email=' + encodeURIComponent(email));
    }
    
    // The token is valid, redirect the user to the sign-in page
    // which will then handle the actual token verification
    redirect(`/api/auth/callback/email?token=${token}&email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error validating email verification token:', error);
    redirect('/auth/debug?error=server_error');
  }
}
