import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import KeyService from './services/keyService';
import Logger from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const WELL_KNOWN_PATH = '/.well-known/appspecific/com.tesla.3p.public-key.pem';

// Fail fast: Basic check if public key file exists - Vercel handles actual serving
try {
  const publicKeyPath = path.join(__dirname, '../public/.well-known/appspecific/com.tesla.3p.public-key.pem');
  if (!fs.existsSync(publicKeyPath)) {
    throw new Error(`Public key file not found at ${publicKeyPath}`);
  }
  // Optionally, validate format here if desired, though KeyService might do it on health check
  Logger.info('Public key file exists at expected path.');
} catch (error) {
  // Log the error and exit with an error code
  if (error instanceof Error) {
    Logger.error(`CRITICAL STARTUP ERROR: ${error.message}`);
  } else {
    Logger.error('CRITICAL STARTUP ERROR: Failed to verify public key file existence');
  }
  process.exit(1); // Exit with error code
}

// Serve the 'public' directory which contains the .well-known folder
// Vercel will handle serving this file efficiently at the root path.
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint (useful for monitoring)
app.get('/health', (req, res) => {
  // Simplified health check for serverless environment
  // No longer depends on KeyService which might fail on file access
  res.status(200).json({ status: 'healthy', message: 'Public key server function is running' });
});

// Start the server
app.listen(PORT, () => {
  Logger.info(`Public Key Server started on port ${PORT}`);
  Logger.info(`Tesla public key should be served by static hosting at: ${WELL_KNOWN_PATH}`);
  Logger.info(`Health check available at: /health`);
});