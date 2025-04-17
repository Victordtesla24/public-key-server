#!/bin/bash
set -e

# Build the project
echo "Building Public Key Server..."
npm run build

# Verify the key file exists
KEY_PATH="public/.well-known/appspecific/com.tesla.3p.public-key.pem"
if [ ! -f "$KEY_PATH" ]; then
  echo "ERROR: Public key file not found at $KEY_PATH"
  exit 1
fi

# Verify the key format (with improved whitespace handling)
KEY_CONTENT=$(cat "$KEY_PATH")
if ! grep -q "BEGIN PUBLIC KEY" "$KEY_PATH" || ! grep -q "END PUBLIC KEY" "$KEY_PATH"; then
  echo "ERROR: Public key file has invalid format"
  echo "Key file content:"
  cat "$KEY_PATH"
  exit 1
fi

echo "Public key validated successfully"

# Check for necessary files
if [ ! -f "public/index.html" ]; then
  echo "WARNING: index.html not found, creating a basic one..."
  # Create a basic index.html if it doesn't exist
  cat > public/index.html << EOL
<!DOCTYPE html>
<html>
<head>
  <title>Tesla Public Key Server</title>
</head>
<body>
  <h1>Tesla Public Key Server</h1>
  <p>Public key available at <a href="/.well-known/appspecific/com.tesla.3p.public-key.pem">/.well-known/appspecific/com.tesla.3p.public-key.pem</a></p>
</body>
</html>
EOL
fi

if [ ! -f "public/404.html" ]; then
  echo "WARNING: 404.html not found, creating a basic one..."
  # Create a basic 404.html if it doesn't exist
  cat > public/404.html << EOL
<!DOCTYPE html>
<html>
<head>
  <title>404 - Not Found</title>
</head>
<body>
  <h1>404 - Not Found</h1>
  <p>The page you're looking for doesn't exist. If you're looking for the Tesla public key, it should be at <a href="/.well-known/appspecific/com.tesla.3p.public-key.pem">/.well-known/appspecific/com.tesla.3p.public-key.pem</a></p>
</body>
</html>
EOL
fi

# Create a static version of the public key file as a fallback
echo "Creating a static version of the public key file for deployment..."
mkdir -p .vercel/output/static/.well-known/appspecific
cp "$KEY_PATH" .vercel/output/static/.well-known/appspecific/

# Deploy to Vercel (requires Vercel CLI to be installed and authenticated)
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!"
echo ""
echo "IMPORTANT POST-DEPLOYMENT STEPS:"
echo "1. Verify the key is accessible at: https://<your-domain>/.well-known/appspecific/com.tesla.3p.public-key.pem"
echo "   You can use the verify-deployment.sh script to check this:"
echo "   ./verify-deployment.sh https://<your-domain>"
echo "2. Call the POST /partner_accounts registration endpoint with your Partner Token"
echo "   Example: curl -X POST https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/partner_accounts \\"
echo "        -H 'Authorization: Bearer YOUR_TESLA_PARTNER_TOKEN' \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"domain\": \"<your-domain>\"}'"
echo "" 