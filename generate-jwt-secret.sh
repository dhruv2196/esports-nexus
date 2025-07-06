
#!/bin/bash

# Script to generate a secure JWT secret for HS512 algorithm
# The secret must be at least 512 bits (64 bytes) long

echo "🔐 Generating secure JWT secret for HS512 algorithm..."
echo ""

# Generate a 64-byte (512-bit) random key and encode it in base64
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

echo "Generated JWT Secret:"
echo "===================="
echo "$JWT_SECRET"
echo ""
echo "Length: ${#JWT_SECRET} characters"
echo ""
echo "📋 To use this secret:"
echo "1. Copy the secret above"
echo "2. Update your .env file or docker-compose.microservices.yml"
echo "3. Restart the services"
echo ""
echo "⚠️  Keep this secret secure and never commit it to version control!"