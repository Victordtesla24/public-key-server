/// <reference types="jest" />
import fs from 'fs';
import path from 'path';
import KeyService from './keyService';

// Mock the fs and path modules
jest.mock('fs');
jest.mock('path');

describe('KeyService', () => {
  // Save the original environment
  const originalEnv = process.env;
  const validKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\n-----END PUBLIC KEY-----';
  
  beforeEach(() => {
    // Reset mocks between tests
    jest.resetAllMocks();
    
    // Reset the module to clear the keyCache
    jest.resetModules();
    
    // Mock environment
    process.env = { ...originalEnv, TESLA_PUBLIC_KEY: undefined };
    
    // Mock path.join to return a predictable path
    (path.join as jest.Mock).mockReturnValue('/mock/path/to/public-key.pem');
    
    // Reset the KeyService private properties for each test
    Object.defineProperty(KeyService, 'keyCache', { value: null, writable: true });
    Object.defineProperty(KeyService, 'PUBLIC_KEY_PATH', { 
      value: '/mock/path/to/public-key.pem',
      writable: true
    });
    Object.defineProperty(KeyService, 'ENV_KEY', { 
      get: function() { return process.env.TESLA_PUBLIC_KEY || ''; } 
    });
  });
  
  afterAll(() => {
    // Restore the original environment
    process.env = originalEnv;
  });
  
  it('should load the key from environment variable when available', () => {
    // Mock the environment variable
    process.env.TESLA_PUBLIC_KEY = validKey;
    
    // Call the service method
    const result = KeyService.loadKey();
    
    // Assert that the correct key was returned
    expect(result).toBe(validKey);
  });
  
  it('should load the key from file when environment variable is not available', () => {
    // Remove the environment variable
    delete process.env.TESLA_PUBLIC_KEY;
    
    // Mock fs functions
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(validKey);
    
    // Call the service method
    const result = KeyService.loadKey();
    
    // Assert that the correct key was returned
    expect(result).toBe(validKey);
    
    // Verify fs was called with the correct path
    expect(fs.existsSync).toHaveBeenCalledWith('/mock/path/to/public-key.pem');
    expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/to/public-key.pem', 'utf8');
  });
  
  it('should throw an error if the key file does not exist', () => {
    // Remove the environment variable
    delete process.env.TESLA_PUBLIC_KEY;
    
    // Mock fs.existsSync to return false
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    // Expect the function to throw an error
    expect(() => KeyService.loadKey()).toThrow('Public key file not found');
  });
  
  it('should throw an error if the key format is invalid', () => {
    // Mock an invalid key in the environment
    process.env.TESLA_PUBLIC_KEY = 'INVALID KEY FORMAT';
    
    // Expect the function to throw an error
    expect(() => KeyService.loadKey()).toThrow('Public key from environment has invalid format');
  });
}); 