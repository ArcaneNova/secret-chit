import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';

import { prisma } from '../db';
import { RateLimiter } from '@/utils/auth';
import { NextRequest } from 'next/server';

/**
 * Context type for tRPC procedures
 */
export type TRPCContext = {
  prisma: typeof prisma;
  session: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  } | null;
  clientIp: string;
  req?: NextRequest;
};

/**
 * tRPC initialization
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Rate limiter middleware
 */
const rateLimitMiddleware = t.middleware(({ ctx, next }) => {
  const { clientIp } = ctx;
  
  if (RateLimiter.isRateLimited(clientIp)) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }
  
  return next({
    ctx,
  });
});

/**
 * Check if user is authenticated
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      // Add user to context
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Export tRPC core utilities
export const router = t.router;
export const publicProcedure = t.procedure.use(rateLimitMiddleware);
export const protectedProcedure = t.procedure.use(rateLimitMiddleware).use(isAuthed);
