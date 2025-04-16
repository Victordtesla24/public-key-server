# Tesla Public Key Server

A dedicated server for hosting a Tesla public key at the exact `.well-known` path required for Tesla's virtual key pairing process.

## Overview

This server has one primary function:
- Serve the PEM-formatted public key at the exact path: `/.well-known/appspecific/com.tesla.3p.public-key.pem`

This is required by Tesla's Fleet API to verify and trust commands sent by your application.

## Prerequisites

Before using this server, ensure:
- You have a valid Tesla developer account
- You have generated a public/private key pair for your application
- You have stored the public key in the required location

## Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd public-key-server

# Install dependencies
npm install
```

## Configuration

The server can be configured using environment variables:

- `PORT` - The port to run the server on (default: 3000)
- `TESLA_PUBLIC_KEY` - The PEM-formatted public key as a string
- `PUBLIC_KEY_PATH` - Path to the public key file (default: './public/.well-known/appspecific/com.tesla.3p.public-key.pem')
- `WELL_KNOWN_PATH` - The exact path to serve the key at (default: '/.well-known/appspecific/com.tesla.3p.public-key.pem')

The public key can be provided either via the environment variable or as a file.

## Development

```bash
# Run the development server
npm run dev

# Run tests
npm test
```

## Deployment

### Vercel (Recommended)

The easiest way to deploy this server is with Vercel, which will automatically handle the HTTPS requirements:

```bash
# Run the deployment script
./deploy.sh
```

Or deploy manually:

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### Other Platforms

You can deploy on any platform that supports Node.js and proper path routing:

1. Build the project: `npm run build`
2. Start the server: `npm start`
3. Ensure the server is accessible over HTTPS
4. Verify the key is being served at the correct path

## Critical Post-Deployment Steps

After deploying, you **MUST**:

1. Verify the key is accessible at: `https://<your-domain>/.well-known/appspecific/com.tesla.3p.public-key.pem`
2. Call the `POST /partner_accounts` registration endpoint using your Partner Token:

```bash
curl -X POST https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/partner_accounts \
  -H 'Authorization: Bearer YOUR_TESLA_PARTNER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"domain": "<your-domain>"}'
```

This step is **mandatory** before vehicle pairing can succeed. Failure to register the domain will result in "application not registered" errors during pairing.

## Health Check

The server provides a health check endpoint at `/health` that verifies the key is accessible.

## Testing Manually

You can verify the server is working correctly by:

```bash
# With curl
curl https://<your-domain>/.well-known/appspecific/com.tesla.3p.public-key.pem
```

The response should be your PEM-formatted public key.

## Error Handling

The server follows a "fail fast" approach:
- If the public key cannot be loaded during startup, the server will exit with an error code
- Runtime errors will return appropriate HTTP status codes
- All errors are logged

## Security

- The server serves the key over HTTPS (mandatory for Tesla's requirements)
- No authentication is applied to the public key endpoint (intentional, as it needs to be publicly accessible)
- The server does not log the full key content to prevent accidental leakage 