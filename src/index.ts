import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import path from 'path';
import { getPublicKey } from './services/keyService';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH ??
  'public/.well-known/appspecific/com.tesla.3p.public-key.pem';
const WELL_KNOWN_PATH = process.env.WELL_KNOWN_PATH ??
  '/.well-known/appspecific/com.tesla.3p.public-key.pem';

const publicKeyPem = getPublicKey(PUBLIC_KEY_PATH) ?? '';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.method === 'GET' && req.url === WELL_KNOWN_PATH) {
    res.setHeader('Content-Type', 'application/x-pem-file');
    return res.status(200).send(publicKeyPem);
  }

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

  return res.status(404).send('Not Found');
}
