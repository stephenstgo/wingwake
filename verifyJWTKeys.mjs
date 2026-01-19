#!/usr/bin/env node
/**
 * Verify JWT keys are set correctly in Convex
 * This helps diagnose JWT_PRIVATE_KEY format issues
 */

import { importPKCS8 } from 'jose';

console.log('\n=== JWT Key Verification ===\n');

// Note: This script can't directly read Convex env vars from here
// But it can help verify the format is correct

console.log('To verify your keys are set correctly:');
console.log('1. Go to https://dashboard.convex.dev');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Check that JWT_PRIVATE_KEY exists');
console.log('5. Check that JWKS exists\n');

console.log('Expected JWT_PRIVATE_KEY format:');
console.log('- Starts with: -----BEGIN PRIVATE KEY-----');
console.log('- Ends with: -----END PRIVATE KEY-----');
console.log('- Single line with spaces (not newlines)');
console.log('- Should be about 1600-1700 characters long\n');

console.log('If you need to regenerate keys:');
console.log('  node generateKeys.mjs\n');

console.log('After setting keys in Dashboard:');
console.log('  npm run convex:dev  (restart Convex dev server)\n');
