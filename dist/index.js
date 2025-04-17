"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("./utils/logger"));
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const WELL_KNOWN_PATH = '/.well-known/appspecific/com.tesla.3p.public-key.pem';
// Fail fast: Basic check if public key file exists - Vercel handles actual serving
try {
    const publicKeyPath = path_1.default.join(__dirname, '../public/.well-known/appspecific/com.tesla.3p.public-key.pem');
    if (!fs_1.default.existsSync(publicKeyPath)) {
        throw new Error(`Public key file not found at ${publicKeyPath}`);
    }
    // Optionally, validate format here if desired, though KeyService might do it on health check
    logger_1.default.info('Public key file exists at expected path.');
}
catch (error) {
    // Log the error and exit with an error code
    if (error instanceof Error) {
        logger_1.default.error(`CRITICAL STARTUP ERROR: ${error.message}`);
    }
    else {
        logger_1.default.error('CRITICAL STARTUP ERROR: Failed to verify public key file existence');
    }
    process.exit(1); // Exit with error code
}
// Serve the 'public' directory which contains the .well-known folder
// Vercel will handle serving this file efficiently at the root path.
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Health check endpoint (useful for monitoring)
app.get('/health', (req, res) => {
    // Simplified health check for serverless environment
    // No longer depends on KeyService which might fail on file access
    res.status(200).json({ status: 'healthy', message: 'Public key server function is running' });
});
// Start the server
app.listen(PORT, () => {
    logger_1.default.info(`Public Key Server started on port ${PORT}`);
    logger_1.default.info(`Tesla public key should be served by static hosting at: ${WELL_KNOWN_PATH}`);
    logger_1.default.info(`Health check available at: /health`);
});
