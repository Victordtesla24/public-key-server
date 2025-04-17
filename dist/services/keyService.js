"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Service responsible for loading and validating the Tesla public key
 */
class KeyService {
    /**
     * Validates that the key has the correct format (begins and ends with the proper markers)
     */
    static validateKeyFormat(key) {
        const trimmedKey = key.trim();
        return trimmedKey.startsWith(this.KEY_BEGIN) && trimmedKey.endsWith(this.KEY_END);
    }
    /**
     * Load the key from the environment variable if available, otherwise from the file system
     */
    static loadKey() {
        // Return cached key if already loaded
        if (this.keyCache) {
            return this.keyCache;
        }
        try {
            // First try to load from environment variable
            if (this.ENV_KEY) {
                logger_1.default.info('Loading public key from environment variable');
                const keyFromEnv = this.ENV_KEY;
                if (!this.validateKeyFormat(keyFromEnv)) {
                    throw new Error('Public key from environment has invalid format');
                }
                this.keyCache = keyFromEnv;
                return keyFromEnv;
            }
            // If not in environment, load from file
            logger_1.default.info(`Loading public key from file: ${this.PUBLIC_KEY_PATH}`);
            // Check if file exists
            if (!fs_1.default.existsSync(this.PUBLIC_KEY_PATH)) {
                throw new Error(`Public key file not found at: ${this.PUBLIC_KEY_PATH}`);
            }
            // Read the key file
            const keyFromFile = fs_1.default.readFileSync(this.PUBLIC_KEY_PATH, 'utf8');
            if (!this.validateKeyFormat(keyFromFile)) {
                throw new Error('Public key file has invalid format');
            }
            this.keyCache = keyFromFile;
            return keyFromFile;
        }
        catch (error) {
            if (error instanceof Error) {
                logger_1.default.error(`Failed to load public key: ${error.message}`);
            }
            else {
                logger_1.default.error('Failed to load public key: Unknown error');
            }
            throw error; // Rethrow to fail fast
        }
    }
    /**
     * Get the fully loaded and validated public key
     */
    static getKey() {
        // If key is not yet loaded, load it
        if (!this.keyCache) {
            return this.loadKey();
        }
        return this.keyCache;
    }
}
KeyService.keyCache = null;
KeyService.PUBLIC_KEY_PATH = process.env.PUBLIC_KEY_PATH || path_1.default.join(process.cwd(), 'public/.well-known/appspecific/com.tesla.3p.public-key.pem');
KeyService.ENV_KEY = process.env.TESLA_PUBLIC_KEY || '';
KeyService.KEY_BEGIN = '-----BEGIN PUBLIC KEY-----';
KeyService.KEY_END = '-----END PUBLIC KEY-----';
exports.default = KeyService;
