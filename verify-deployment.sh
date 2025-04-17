#!/bin/bash
set -e

# Get the deployment URL from argument or use default
DEPLOY_URL=${1:-"https://public-key-server-cmqevxh2b-vics-projects-31447d42.vercel.app"}
KEY_PATH="/.well-known/appspecific/com.tesla.3p.public-key.pem"
FULL_URL="${DEPLOY_URL}${KEY_PATH}"

echo "Verifying public key accessibility at: ${FULL_URL}"

# Try to fetch the public key
response=$(curl -s -o /dev/null -w "%{http_code}" "${FULL_URL}")

if [ "$response" == "200" ]; then
  echo "✅ Public key is accessible (Status: 200 OK)"
  
  # Verify content
  content=$(curl -s "${FULL_URL}")
  if [[ "$content" == *"BEGIN PUBLIC KEY"* && "$content" == *"END PUBLIC KEY"* ]]; then
    echo "✅ Public key content validated"
  else
    echo "❌ Error: Content doesn't look like a valid public key"
    exit 1
  fi
else
  echo "❌ Error: Public key is not accessible (Status: ${response})"
  echo "Troubleshooting suggestions:"
  echo "1. Check Vercel deployment logs for errors"
  echo "2. Verify that the file exists in public/.well-known/appspecific/com.tesla.3p.public-key.pem"
  echo "3. Ensure vercel.json routing is correctly configured"
  exit 1
fi

# Check health endpoint
HEALTH_URL="${DEPLOY_URL}/health"
health_response=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}")

if [ "$health_response" == "200" ]; then
  echo "✅ Health endpoint is accessible (Status: 200 OK)"
else
  echo "❌ Warning: Health endpoint is not accessible (Status: ${health_response})"
fi

echo "Verification completed successfully!" 