#!/usr/bin/env node
/**
 * Generate JWT keys for Convex Auth
 * 
 * Run: node generateKeys.mjs
 * 
 * This will output two environment variables that need to be set in your Convex deployment:
 * - JWT_PRIVATE_KEY: RSA private key (single-line)
 * - JWKS: JSON Web Key Set with the public key
 * 
 * To set them:
 * 1. Via Convex Dashboard: Settings → Environment Variables → Add each variable
 * 2. Via CLI: npx convex env set JWT_PRIVATE_KEY "..." and npx convex env set JWKS '...'
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

// Print the environment variables
// IMPORTANT: Convex Auth expects JWT_PRIVATE_KEY as a single line with spaces instead of newlines
// The library will convert spaces back to newlines when reading the key
const singleLineKey = privateKeyPEM.trimEnd().replace(/\n/g, ' ');

console.log('\n=== Convex Environment Variables ===\n');
console.log('⚠️  IMPORTANT: Use the Convex Dashboard (CLI has issues with long values)\n');
console.log('1. Go to https://dashboard.convex.dev');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables\n');
console.log('--- JWT_PRIVATE_KEY (copy the value below, without quotes) ---');
console.log(singleLineKey);
console.log('\n--- JWKS (copy the JSON below) ---');
console.log(JSON.stringify(jwks));
console.log('\n=== After Setting in Dashboard ===');
console.log('Restart your Convex dev server: npm run convex:dev\n');
console.log('Note: The CLI method may not work correctly. Use the Dashboard instead.\n');
