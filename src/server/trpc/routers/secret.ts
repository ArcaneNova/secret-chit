import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../index';
import { encrypt, decrypt } from '@/utils/encrypt';
import { hashPassword, verifyPassword } from '@/utils/auth';

export const secretRouter = router({
  /**
   * Create a new secret
   */
  create: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(10000),
        oneTime: z.boolean().default(false),
        expiresIn: z.number().min(1).max(30 * 24 * 60 * 60), // Max 30 days in seconds
        password: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Calculate expiration date
        const expiresAt = new Date(Date.now() + input.expiresIn * 1000);
        
        // Encrypt the secret text
        const encryptedText = encrypt(input.text);
        
        // Hash the password if provided
        let passwordHash = null;
        if (input.password) {
          passwordHash = await hashPassword(input.password);
        }
        
        // Create the secret in the database
        const secret = await ctx.prisma.secret.create({
          data: {
            text: encryptedText,
            passwordHash,
            oneTime: input.oneTime,
            expiresAt,
            userId: ctx.session?.user?.id || input.userId || null,
          },
        });
        
        return {
          id: secret.id,
          expiresAt: secret.expiresAt,
        };
      } catch (error) {
        console.error('Error creating secret:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create secret',
        });
      }
    }),

  /**
   * Get a secret by ID
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        password: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const secret = await ctx.prisma.secret.findUnique({
          where: { id: input.id },
        });
        
        // Check if secret exists
        if (!secret) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Secret not found',
          });
        }
        
        // Check if secret has expired
        if (secret.expiresAt < new Date()) {
          await ctx.prisma.secret.delete({
            where: { id: input.id },
          });
          
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'This secret has expired',
          });
        }
        
        // Check if secret has been viewed and is one-time
        if (secret.viewed && secret.oneTime) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'This one-time secret has already been viewed',
          });
        }
        
        // Check password if required
        if (secret.passwordHash) {
          // If no password provided
          if (!input.password) {
            return {
              id: secret.id,
              requiresPassword: true,
              text: null,
              expiresAt: secret.expiresAt,
            };
          }
          
          // Verify password
          const passwordValid = await verifyPassword(input.password, secret.passwordHash);
          if (!passwordValid) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Invalid password',
            });
          }
        }
        
        // If one-time, mark as viewed
        if (secret.oneTime) {
          await ctx.prisma.secret.update({
            where: { id: secret.id },
            data: { viewed: true },
          });
        }
        
        // Decrypt the secret text
        const decryptedText = decrypt(secret.text);
        
        return {
          id: secret.id,
          text: decryptedText,
          expiresAt: secret.expiresAt,
          requiresPassword: false,
          oneTime: secret.oneTime,
          viewed: secret.oneTime ? true : secret.viewed,
        };
      } catch (error) {
        // Re-throw tRPC errors
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error retrieving secret:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve secret',
        });
      }
    }),

  /**
   * Get all secrets for the authenticated user
   */
  getMySecrets: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      try {
        const userId = ctx.session.user.id;
        
        const secrets = await ctx.prisma.secret.findMany({
          where: {
            userId,
            // Filter by search term if provided (simple id search)
            ...(input?.search ? { id: { contains: input.search } } : {}),
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            expiresAt: true,
            viewed: true,
            oneTime: true,
            createdAt: true,
            passwordHash: true,
          },
        });
          // Add status field for frontend display
        return secrets.map((secret: {
          id: string;
          expiresAt: Date;
          viewed: boolean;
          oneTime: boolean;
          createdAt: Date;
          passwordHash: string | null;
        }) => {
          const now = new Date();
          let status: 'active' | 'expired' | 'viewed' = 'active';
          
          if (secret.expiresAt < now) {
            status = 'expired';
          } else if (secret.viewed && secret.oneTime) {
            status = 'viewed';
          }
          
          return {
            ...secret,
            hasPassword: Boolean(secret.passwordHash),
            passwordHash: undefined, // Don't send hash to client
            status,
          };
        });
      } catch (error) {
        console.error('Error fetching user secrets:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch secrets',
        });
      }
    }),

  /**
   * Delete a secret
   */
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.session.user.id;
        
        // Ensure the secret belongs to the user
        const secret = await ctx.prisma.secret.findUnique({
          where: { id: input.id },
          select: { userId: true },
        });
        
        if (!secret || secret.userId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this secret',
          });
        }
        
        // Delete the secret
        await ctx.prisma.secret.delete({
          where: { id: input.id },
        });
        
        return { success: true };
      } catch (error) {
        // Re-throw tRPC errors
        if (error instanceof TRPCError) {
          throw error;
        }
        
        console.error('Error deleting secret:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete secret',
        });
      }
    }),
});
