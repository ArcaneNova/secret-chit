import { prisma } from '../db';
import { logger } from '../utils/logger';

/**
 * Cleanup expired secrets from the database
 * This job should be run regularly (e.g., every hour) to clean up secrets
 * that have passed their expiration date
 */
export async function cleanupExpiredSecrets() {
  try {
    const now = new Date();
    
    logger.info('Running cleanup job for expired secrets');
    
    // Delete all secrets that have expired
    const result = await prisma.secret.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });
    
    logger.info(`Successfully deleted ${result.count} expired secrets`);
    
    return {
      success: true,
      deletedCount: result.count,
    };
  } catch (error) {
    logger.error('Error cleaning up expired secrets:', error);
    
    return {
      success: false,
      error: String(error),
    };
  }
}
