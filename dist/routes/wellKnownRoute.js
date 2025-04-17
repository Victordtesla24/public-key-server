"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const keyService_1 = __importDefault(require("../services/keyService"));
const logger_1 = __importDefault(require("../utils/logger"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create a router instance
const router = (0, express_1.Router)();
/**
 * GET handler for the Tesla public key at the required well-known path
 * This must be mounted at /.well-known/appspecific/com.tesla.3p.public-key.pem
 */
router.get('/', (req, res) => {
    try {
        // Log the request
        logger_1.default.info(`Public key requested from: ${req.ip}`);
        // Get the key
        const publicKey = keyService_1.default.getKey();
        // Send the key with the appropriate content type
        res.setHeader('Content-Type', 'application/x-pem-file');
        res.status(200).send(publicKey);
        logger_1.default.debug('Public key served successfully');
    }
    catch (error) {
        // Log the error
        if (error instanceof Error) {
            logger_1.default.error(`Error serving public key: ${error.message}`);
        }
        else {
            logger_1.default.error('Error serving public key: Unknown error');
        }
        // As fallback, try to read the file directly from the public directory
        try {
            const publicKeyPath = path_1.default.join(process.cwd(), 'public/.well-known/appspecific/com.tesla.3p.public-key.pem');
            if (fs_1.default.existsSync(publicKeyPath)) {
                const publicKey = fs_1.default.readFileSync(publicKeyPath, 'utf8');
                res.setHeader('Content-Type', 'application/x-pem-file');
                res.status(200).send(publicKey);
                logger_1.default.info('Public key served successfully from public directory');
                return;
            }
        }
        catch (fallbackError) {
            logger_1.default.error(`Fallback error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        }
        // Return a 500 error if all else fails
        res.status(500).send('Internal Server Error: Unable to retrieve the public key');
    }
});
exports.default = router;
