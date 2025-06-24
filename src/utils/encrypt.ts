import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'this-is-a-fallback-key-change-in-prod';

// Make sure the key is the correct length for AES-256
const getKey = () => {
  const key = Buffer.from(SECRET_KEY);
  // AES-256 requires a 32-byte key
  if (key.length !== 32) {
    // If not 32 bytes, hash it to get a consistent length
    return crypto.createHash('sha256').update(SECRET_KEY).digest();
  }
  return key;
};

/**
 * Encrypts text using AES-256-CBC
 * @param text - The text to encrypt
 * @returns The encrypted text as a string with IV and encrypted data
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16); // AES block size is 16 bytes
  const key = getKey();
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data (IV is needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts text that was encrypted with the encrypt function
 * @param encryptedData - The encrypted text (format: "iv:encryptedText")
 * @returns The decrypted text
 */
export function decrypt(encryptedData: string): string {
  try {
    const [ivHex, encryptedText] = encryptedData.split(':');
    
    if (!ivHex || !encryptedText) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const key = getKey();
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}
