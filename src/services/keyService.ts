import fs from 'fs';
import path from 'path';
import Logger from '../utils/logger';

/**
 * Service responsible for loading and validating the Tesla public key
 */
class KeyService {
  private static keyCache: string | null = null;
  private static readonly PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH || path.join(process.cwd(), 'public/.well-known/appspecific/com.tesla.3p.public-key.pem');
  private static readonly ENV_KEY = process.env.TESLA_PUBLIC_KEY || '';
  private static readonly KEY_BEGIN = '-----BEGIN PUBLIC KEY-----';
  private static readonly KEY_END = '-----END PUBLIC KEY-----';
  
  /**
   * Validates that the key has the correct format (begins and ends with the proper markers)
   */
  private static validateKeyFormat(key: string): boolean {
    const trimmedKey = key.trim();
    return trimmedKey.startsWith(this.KEY_BEGIN) && trimmedKey.endsWith(this.KEY_END);
  }
  
  /**
   * Load the key from the environment variable if available, otherwise from the file system
   */
  public static loadKey(): string {
    // Return cached key if already loaded
    if (this.keyCache) {
      return this.keyCache;
    }

    try {
      // First try to load from environment variable
      if (this.ENV_KEY) {
        Logger.info('Loading public key from environment variable');
        const keyFromEnv = this.ENV_KEY;
        
        if (!this.validateKeyFormat(keyFromEnv)) {
          throw new Error('Public key from environment has invalid format');
        }
        
        this.keyCache = keyFromEnv;
        return keyFromEnv;
      }
      
      // If not in environment, load from file
      Logger.info(`Loading public key from file: ${this.PUBLIC_KEY_PATH}`);
      
      // Check if file exists
      if (!fs.existsSync(this.PUBLIC_KEY_PATH)) {
        throw new Error(`Public key file not found at: ${this.PUBLIC_KEY_PATH}`);
      }
      
      // Read the key file
      const keyFromFile = fs.readFileSync(this.PUBLIC_KEY_PATH, 'utf8');
      
      if (!this.validateKeyFormat(keyFromFile)) {
        throw new Error('Public key file has invalid format');
      }
      
      this.keyCache = keyFromFile;
      return keyFromFile;
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(`Failed to load public key: ${error.message}`);
      } else {
        Logger.error('Failed to load public key: Unknown error');
      }
      throw error; // Rethrow to fail fast
    }
  }
  
  /**
   * Get the fully loaded and validated public key
   */
  public static getKey(): string {
    // If key is not yet loaded, load it
    if (!this.keyCache) {
      return this.loadKey();
    }
    return this.keyCache;
  }
}

export default KeyService; 