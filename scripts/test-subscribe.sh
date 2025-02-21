#!/bin/bash

# Load environment variables from .env file
source .env

# Set default values
EMAIL=${1:-"test@example.com"}
FIRST_NAME=${2:-"Test"}
FREQUENCY=${3:-"daily"}

# Debug info
echo "Debug Information:"
echo "Email: $EMAIL"
echo "First Name: $FIRST_NAME"
echo "Frequency: $FREQUENCY"
echo

# Create JSON payload with proper escaping
JSON_PAYLOAD="{\"email\":\"$EMAIL\",\"firstName\":\"$FIRST_NAME\",\"frequency\":\"$FREQUENCY\"}"

echo "Payload: $JSON_PAYLOAD"
echo

# Make the request
curl -v -X POST "http://localhost:3000/api/newsletter/subscribe" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD"

echo # Add newline after response

# To test:
# Make the script executable
# chmod +x scripts/test-subscribe.sh

# Test with specific values
# ./scripts/test-subscribe.sh "user@example.com" "John" "weekly"

# Test with default values
# ./scripts/test-subscribe.sh