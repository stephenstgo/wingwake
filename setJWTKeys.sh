#!/bin/bash
# Helper script to set JWT keys in Convex with proper formatting
# This ensures newlines are preserved for PKCS#8 format

echo "Generating JWT keys..."

# Generate keys and save to temp files
node -e "
import('jose').then(async ({generateKeyPair, exportPKCS8, exportJWK}) => {
  const {publicKey, privateKey} = await generateKeyPair('RS256', {modulusLength: 2048});
  const privateKeyPEM = await exportPKCS8(privateKey);
  const publicKeyJWK = await exportJWK(publicKey);
  const jwks = {keys: [{...publicKeyJWK, use: 'sig', alg: 'RS256'}]};
  
  // Write private key to file (with newlines preserved)
  const fs = await import('fs');
  fs.writeFileSync('/tmp/jwt_private_key.txt', privateKeyPEM);
  fs.writeFileSync('/tmp/jwt_jwks.txt', JSON.stringify(jwks));
  
  console.log('Keys generated and saved to /tmp/jwt_private_key.txt and /tmp/jwt_jwks.txt');
})
" 2>&1

if [ $? -ne 0 ]; then
  echo "Error: Failed to generate keys. Make sure jose is installed."
  exit 1
fi

echo ""
echo "Setting JWT_PRIVATE_KEY (with newlines preserved)..."
cat /tmp/jwt_private_key.txt | npx convex env set JWT_PRIVATE_KEY "$(cat)"

echo ""
echo "Setting JWKS..."
cat /tmp/jwt_jwks.txt | npx convex env set JWKS "$(cat)"

echo ""
echo "Verifying..."
npx convex env list

echo ""
echo "✅ Done! Please restart your Convex dev server: npm run convex:dev"
echo ""
echo "Note: The keys are stored in /tmp/ if you need to reference them."
