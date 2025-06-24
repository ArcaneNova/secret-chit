import { createTransport } from 'nodemailer';

/**
 * Email transport configuration for NextAuth
 * This helper creates a properly configured Nodemailer transport
 * based on environment variables
 */
export function createEmailTransport() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.EMAIL_SERVER_PORT);
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM;
  
  if (!host || !port || !user || !pass || !from) {
    console.warn("Email provider configuration is incomplete. Check environment variables.");
    return null;
  }
  
  // Configure transport with secure=true for port 465, false otherwise
  const secure = port === 465;
  
  console.log(`Creating email transport for ${host}:${port} (secure: ${secure})`);
  
  try {
    const transport = createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        // Don't fail on invalid certs in development
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });
    
    return transport;
  } catch (error) {
    console.error("Failed to create email transport:", error);
    return null;
  }
}
