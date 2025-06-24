import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { NextRequest } from 'next/server';

import { appRouter } from '@/server/trpc/routers/_app';
import { prisma } from '@/server/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';

/**
 * tRPC API handler for Next.js App Router
 */
const handler = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Get client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for') || 
    'unknown';
    
  const clientIp = String(ip).split(',')[0];
  
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({
      prisma,
      session,
      clientIp,
      req,
    }),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC Error on '${path}':`, error);
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
