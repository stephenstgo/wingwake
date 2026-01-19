#!/usr/bin/env node
/**
 * Generate and set JWT keys for Convex Auth
 * This script generates keys and provides instructions for setting them via Dashboard
 * 
 * Run: node setKeysForConvex.mjs
 */

import { generateKeyPair, exportPKCS8, exportJWK } from 'jose';

// Generate RSA key pair
const { publicKey, privateKey } = await generateKeyPair('RS256', {
  modulusLength: 2048,
});

// Export private key as PKCS8 (PEM format)
const privateKeyPEM = await exportPKCS8(privateKey);

// Export public key as JWK
const publicKeyJWK = await exportJWK(publicKey);

// Create JWKS (JSON Web Key Set)
const jwks = {
  keys: [
    {
      ...publicKeyJWK,
      use: 'sig',
      alg: 'RS256',
    },
  ],
};

// Format for Convex: single line with spaces (as per Convex Auth docs)
const singleLineKey = privateKeyPEM.trimEnd().replace(/\n/g, ' ');

console.log('\n=== Convex Environment Variables ===\n');
console.log('IMPORTANT: Use the Convex Dashboard to set these (CLI may not preserve format correctly)\n');
console.log('1. Go to https://dashboard.convex.dev');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables\n');
console.log('--- Copy JWT_PRIVATE_KEY (paste exactly as shown) ---');
console.log(singleLineKey);
console.log('\n--- Copy JWKS (paste exactly as shown) ---');
console.log(JSON.stringify(jwks));
console.log('\n=== After Setting ===');
console.log('Restart your Convex dev server: npm run convex:dev\n');
