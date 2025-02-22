#!/bin/bash

# Load environment variables from .env file
source .env

# Set email (can be passed as argument)
EMAIL=${1:-"justinhnaylor@gmail.com"}

# Generate timestamp
TIMESTAMP=$(date +%s000)

# Generate signature using NEWSLETTER_SECRET_KEY from .env
SIGNATURE=$(echo -n "$TIMESTAMP:unsubscribe" | openssl dgst -sha256 -hmac "$NEWSLETTER_SECRET_KEY" | cut -d' ' -f2)

# Debug info
echo "Debug Information:"
echo "Email: $EMAIL"
echo "Timestamp: $TIMESTAMP"
echo "API Key: ${NEWSLETTER_API_KEY:0:10}..." # Show first 10 chars
echo "Signature: ${SIGNATURE:0:10}..." # Show first 10 chars
echo

# Make the request
curl -v "http://localhost:3000/api/newsletter/unsubscribe?email=$EMAIL&timestamp=$TIMESTAMP&signature=$SIGNATURE&key=$NEWSLETTER_API_KEY"

echo # Add newline after response

# To test:
# Make the script executable
# chmod +x scripts/test-unsubscribe.sh

# Test unsubscribe with specific email
# ./scripts/test-unsubscribe.sh "user@example.com"

# Test unsubscribe with default email
# ./scripts/test-unsubscribe.sh