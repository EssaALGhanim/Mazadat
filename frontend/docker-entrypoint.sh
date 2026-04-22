#!/bin/sh
set -e

# Get environment variables or use defaults
API_URL=${VITE_API_URL:-http://localhost:8080/api/v1}
IMAGE_URL=${VITE_IMAGE_BASE_URL:-http://localhost:8080}

echo "Frontend Configuration:"
echo "API URL: $API_URL"
echo "Image URL: $IMAGE_URL"

# Create a config file that the frontend can read
cat > /usr/share/nginx/html/config.json <<EOF
{
  "API_URL": "$API_URL",
  "IMAGE_BASE_URL": "$IMAGE_URL"
}
EOF

echo "Config file created at /usr/share/nginx/html/config.json"

# Execute the main command
exec "$@"

