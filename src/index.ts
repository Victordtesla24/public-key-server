import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { getPublicKey } from './services/keyService';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const publicKeyPath = process.env.PUBLIC_KEY_PATH;
const wellKnownPath = process.env.WELL_KNOWN_PATH;
const port = process.env.PORT || 3001;

if (!publicKeyPath) {
    console.error('FATAL ERROR: PUBLIC_KEY_PATH is not set.');
    process.exit(1);
}
if (!wellKnownPath) {
    console.error('FATAL ERROR: WELL_KNOWN_PATH is not set.');
    process.exit(1);
}

const publicKeyPem = getPublicKey(publicKeyPath);
if (!publicKeyPem) {
    console.error('FATAL ERROR: Failed to load public key.');
    process.exit(1);
}

const app = express();

// Serve static assets from `public/`
app.use(express.static(path.resolve(process.cwd(), 'public')));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// **New**: Root route for homepage
app.get('/', (_req: Request, res: Response) => {
    res
      .status(200)
      .send(
        'Public Key Server is running. Endpoints: ' +
        '/.well-known/appspecific/com.tesla.3p.public-key.pem, /health'
      );
});

// Serve the Tesla public key
app.get(wellKnownPath, (_req: Request, res: Response) => {
    console.log(`Serving public key from ${publicKeyPath}`);
    res
      .type('application/x-pem-file')
      .status(200)
      .send(publicKeyPem);
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        publicKeyServer: {
            running: true,
            publicKeyLoaded: true
        }
    });
});

// Catch-all 404
app.use('*', (_req: Request, res: Response) => {
    res.status(404).send('Not Found');
});

// Start server (for local dev; in Vercel this logs but doesn’t block)
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
