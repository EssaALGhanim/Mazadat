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

# Create config files that the frontend can read
mkdir -p /usr/share/nginx/html
cat > /usr/share/nginx/html/config.json <<EOF
{
  "API_URL": "$API_URL",
  "IMAGE_BASE_URL": "$IMAGE_URL"
}
EOF

cat > /usr/share/nginx/html/config.js <<EOF
window.__MAZADAT_CONFIG__ = {
  API_URL: "$API_URL",
  IMAGE_BASE_URL: "$IMAGE_URL"
};
EOF

if [ -f /usr/share/nginx/html/config.json ]; then
    echo "✓ Config file created successfully"
    cat /usr/share/nginx/html/config.json
else
    echo "✗ ERROR: Failed to create config file"
    exit 1
fi

if [ ! -f /usr/share/nginx/html/config.js ]; then
    echo "✗ ERROR: Failed to create config.js"
    exit 1
fi

# Verify dist files exist
if [ ! -f /usr/share/nginx/html/index.html ]; then
    echo "✗ ERROR: index.html not found in /usr/share/nginx/html"
    echo "Available files:"
    ls -la /usr/share/nginx/html/
    exit 1
else
    echo "✓ index.html found"
fi

# Test nginx configuration
echo "======================================"
echo "Testing nginx configuration..."
echo "======================================"
nginx -t
if [ $? -ne 0 ]; then
    echo "✗ ERROR: Nginx configuration test failed"
    exit 1
fi
echo "✓ Nginx configuration is valid"

echo "======================================"
echo "Starting nginx..."
echo "======================================"

# Execute nginx in foreground
exec nginx -g "daemon off;"

