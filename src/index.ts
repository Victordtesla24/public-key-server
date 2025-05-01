import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import path from 'path';
import { getPublicKey } from './services/keyService';

// Load .env if present
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Use environment variables or sensible defaults
const PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH
  ?? 'public/.well-known/appspecific/com.tesla.3p.public-key.pem';
const WELL_KNOWN_PATH = process.env.WELL_KNOWN_PATH
  ?? '/.well-known/appspecific/com.tesla.3p.public-key.pem';

// Load the PEM (fail-fast not needed in a serverless function)
const publicKeyPem = getPublicKey(PUBLIC_KEY_PATH) || '';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Logging (in Vercel logs)
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Serve public key
  if (req.method === 'GET' && req.url === WELL_KNOWN_PATH) {
    console.log(`Serving public key from ${PUBLIC_KEY_PATH}`);
    res.setHeader('Content-Type', 'application/x-pem-file');
    return res.status(200).send(publicKeyPem);
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      publicKeyServer: {
        running: true,
        publicKeyLoaded: !!publicKeyPem
      }
    });
  }

  // Fallback 404
  return res.status(404).send('Not Found');
}
