import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import type { Adapter } from 'next-auth/adapters';

import { prisma } from "@/server/db";

// Enable more detailed logging to debug route issues
const DEBUG_AUTH = process.env.NODE_ENV === 'development';

// Create a custom adapter that handles verification token errors
function createCustomPrismaAdapter(p: typeof prisma): Adapter {
  const standardAdapter = PrismaAdapter(p);
  
  return {
    ...standardAdapter,
    // Override useVerificationToken to work around PostgreSQL REPLICA IDENTITY issue
    async useVerificationToken(params) {
      console.log('Looking up verification token...', params);
      
      try {
        
        console.log('Attempting table lookup with VerificationToken model...');
        const rawResults = await p.$queryRaw`
          SELECT "identifier", "token", "expires" 
          FROM "VerificationToken" 
          WHERE "token" = ${params.token}
        `.catch((e: Error) => {
          console.log('Raw query failed, will try standard query', e);
          return null;
        });
        
        console.log('Raw query results:', rawResults);
        
        let token;
        
        if (Array.isArray(rawResults) && rawResults.length > 0) {
          token = rawResults[0];
        } else {
          // Fall back to standard query
          token = await p.verificationToken.findUnique({
            where: {
              token: params.token,
            },
          });
        }
        
        if (!token) {
          console.error('Token not found in database');
          throw new Error('Invalid token not found in database');
        }
        
        if (token.identifier !== params.identifier) {
          console.error('Token identifier does not match');
          throw new Error('Invalid token (identifier mismatch)');
        }
        
        if (new Date(token.expires) < new Date()) {
          console.error('Token expired', { expires: token.expires, now: new Date() });
          throw new Error('Token has expired');
        }
        
        // Try to delete but don't fail if it doesn't work
        try {          // try raw delete first
          await p.$executeRaw`
            DELETE FROM "VerificationToken" 
            WHERE "token" = ${params.token}
          `.catch((e: Error) => {
            console.log('Raw delete failed, will try standard delete', e);
            return null;
          });
        } catch (error) {
          console.warn('Could not delete token with raw SQL, trying standard delete', error);
          
          try {
            await p.verificationToken.deleteMany({
              where: { token: params.token }
            });
          } catch (deleteError) {
            console.warn('Could not delete token, continuing anyway:', deleteError);
            // Proceed anyway since we've already verified the token
          }
        }
        
        // Return the valid token
        console.log('Verification token valid for', token.identifier);
        return token;
      } catch (error) {
        console.error('Verification token processing failed:', error);
        throw error;
      }
    }
  };
}

// Auth options for NextAuth.js
export const authOptions: NextAuthOptions = {
  debug: DEBUG_AUTH,
  adapter: createCustomPrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),    EmailProvider({
      server: process.env.EMAIL_SERVER_HOST ? {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER || '',
          pass: process.env.EMAIL_SERVER_PASSWORD || '',
        },
        secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
      } : '',
      from: process.env.EMAIL_FROM,
      // 24 hours expiration age
      maxAge: 24 * 60 * 60,
    }),
  ],  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Log sign-in attempts to help with debugging
      console.log('[NextAuth] Sign-in attempt:', { 
        user: user?.email,
        provider: account?.provider,
        isEmailSignIn: Boolean(email),
      });
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Log redirects for debugging
      console.log('[NextAuth] Redirect:', { url, baseUrl });
      
      // Make sure we only redirect to trusted URLs
      if (url.startsWith(baseUrl)) {
        return url;
      } else if (url.startsWith('/')) {
        return new URL(url, baseUrl).toString();
      }
      return baseUrl;
    },
    session({ session, user, token }) {
      // When using JWT strategy, the user is actually part of the token
      if (session.user && token) {
        session.user.id = token.sub as string;
      } else if (session.user && user) {
        session.user.id = user.id;
      }
      
      // Add debugging logs for session
      console.log('[NextAuth] Session callback:', { 
        userId: session.user?.id,
        email: session.user?.email 
      });
      
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      // Add debugging logs for JWT
      console.log('[NextAuth] JWT callback:', { 
        tokenSub: token.sub,
        userId: user?.id 
      });
      
      return token;
    }
  },pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  // Enable debugging logs for page redirects
  logger: {
    error: (code, ...message) => {
      console.error(`[next-auth][error][${code}]`, ...message);
    },
    warn: (code, ...message) => {
      console.warn(`[next-auth][warn][${code}]`, ...message);
    },
    debug: DEBUG_AUTH
      ? (code, ...message) => {
          console.log(`[next-auth][debug][${code}]`, ...message);
        }
      : undefined,
  },
  session: {
    strategy: "jwt",
  },
};
