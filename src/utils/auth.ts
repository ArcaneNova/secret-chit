import bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifies a password against a hash
 * @param password - The plain text password to verify
 * @param hash - The hash to verify against
 * @returns Whether the password matches the hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Rate limiting utility to track attempts by IP
 */
export class RateLimiter {
  private static attempts: Record<string, { count: number, resetTime: number }> = {};
  private static MAX_ATTEMPTS = 5;
  private static TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
  
  /**
   * Check if an IP has exceeded the rate limit
   * @param ip The IP address to check
   * @returns Whether the IP is rate limited
   */
  static isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = this.attempts[ip];
    
    // Clean up expired records
    Object.keys(this.attempts).forEach(key => {
      if (this.attempts[key].resetTime < now) {
        delete this.attempts[key];
      }
    });
    
    // No record or expired record
    if (!record || record.resetTime < now) {
      this.attempts[ip] = {
        count: 1,
        resetTime: now + this.TIMEOUT_MS
      };
      return false;
    }
    
    // Increment attempt count
    record.count++;
    
    // Check if rate limited
    return record.count > this.MAX_ATTEMPTS;
  }
  
  /**
   * Reset the rate limit for an IP
   * @param ip The IP address to reset
   */
  static resetLimit(ip: string): void {
    delete this.attempts[ip];
  }
}
