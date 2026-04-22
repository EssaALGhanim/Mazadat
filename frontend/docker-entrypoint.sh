#!/bin/sh

# Get environment variables or use defaults
API_URL="${VITE_API_URL:-http://localhost:8080/api/v1}"
IMAGE_URL="${VITE_IMAGE_BASE_URL:-http://localhost:8080}"

echo "======================================"
echo "Frontend Configuration"
echo "======================================"
echo "API URL: $API_URL"
echo "Image URL: $IMAGE_URL"
echo "======================================"

# Create a config file that the frontend can read
cat > /usr/share/nginx/html/config.json <<EOF
{
  "API_URL": "$API_URL",
  "IMAGE_BASE_URL": "$IMAGE_URL"
}
EOF

if [ -f /usr/share/nginx/html/config.json ]; then
    echo "✓ Config file created successfully"
    cat /usr/share/nginx/html/config.json
else
    echo "✗ ERROR: Failed to create config file"
    exit 1
fi

echo "======================================"
echo "Starting nginx..."
echo "======================================"

# Execute the main command
exec "$@"

