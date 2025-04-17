import { Router, Request, Response } from 'express';
import KeyService from '../services/keyService';
import Logger from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Create a router instance
const router = Router();

/**
 * GET handler for the Tesla public key at the required well-known path
 * This must be mounted at /.well-known/appspecific/com.tesla.3p.public-key.pem
 */
router.get('/', (req: Request, res: Response) => {
  try {
    // Log the request
    Logger.info(`Public key requested from: ${req.ip}`);
    
    // Get the key
    const publicKey = KeyService.getKey();
    
    // Send the key with the appropriate content type
    res.setHeader('Content-Type', 'application/x-pem-file');
    res.status(200).send(publicKey);
    
    Logger.debug('Public key served successfully');
  } catch (error) {
    // Log the error
    if (error instanceof Error) {
      Logger.error(`Error serving public key: ${error.message}`);
    } else {
      Logger.error('Error serving public key: Unknown error');
    }
    
    // As fallback, try to read the file directly from the public directory
    try {
      const publicKeyPath = path.join(process.cwd(), 'public/.well-known/appspecific/com.tesla.3p.public-key.pem');
      if (fs.existsSync(publicKeyPath)) {
        const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
        res.setHeader('Content-Type', 'application/x-pem-file');
        res.status(200).send(publicKey);
        Logger.info('Public key served successfully from public directory');
        return;
      }
    } catch (fallbackError) {
      Logger.error(`Fallback error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
    }
    
    // Return a 500 error if all else fails
    res.status(500).send('Internal Server Error: Unable to retrieve the public key');
  }
});

export default router; 