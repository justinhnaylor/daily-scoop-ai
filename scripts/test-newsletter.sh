#!/bin/bash

# Load environment variables from .env file
source .env

# Generate timestamp
TIMESTAMP=$(date +%s000)

# Set frequency (can be passed as argument, defaults to daily)
FREQUENCY=${1:-"daily"}

# Generate signature using NEWSLETTER_SECRET_KEY from .env
SIGNATURE=$(echo -n "$TIMESTAMP:$FREQUENCY" | openssl dgst -sha256 -hmac "$NEWSLETTER_SECRET_KEY" | cut -d' ' -f2)

# Debug info
echo "Debug Information:"
echo "Timestamp: $TIMESTAMP"
echo "Frequency: $FREQUENCY"
echo "API Key: ${NEWSLETTER_API_KEY:0:10}..." # Show first 10 chars
echo "Signature: ${SIGNATURE:0:10}..." # Show first 10 chars
echo

# Make the request
curl -v -X POST "http://localhost:3000/api/newsletter/send?frequency=$FREQUENCY" \
  -H "Authorization: Bearer $NEWSLETTER_API_KEY" \
  -H "X-Timestamp: $TIMESTAMP" \
  -H "X-Signature: $SIGNATURE"

echo # Add newline after response


# To test:
# Make the script executable
# chmod +x scripts/test-newsletter.sh

# Test daily newsletter
# ./scripts/test-newsletter.sh daily