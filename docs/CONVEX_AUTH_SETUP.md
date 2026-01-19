# Convex Auth Setup Guide

Convex Auth requires JWT keys to be configured in your Convex deployment's environment variables.

## Quick Setup

1. **Generate JWT Keys:**
   ```bash
   node generateKeys.mjs
   ```
   This will output two values to copy.

2. **Set Environment Variables in Convex Dashboard (REQUIRED):**
   
   ⚠️ **IMPORTANT: Use the Dashboard, not CLI** - The CLI has issues with long values.
   
   - Go to https://dashboard.convex.dev
   - Select your project
   - Navigate to **Settings** → **Environment Variables**
   - Click **Add Variable**
   - **Variable name**: `JWT_PRIVATE_KEY`
   - **Value**: Copy the entire key from the script output (starts with `-----BEGIN PRIVATE KEY-----`, single line with spaces)
   - Click **Save**
   - Click **Add Variable** again
   - **Variable name**: `JWKS`
   - **Value**: Copy the JWKS JSON from the script output
   - Click **Save**

3. **Restart Convex Dev Server (CRITICAL):**
   ```bash
   # Stop your current convex dev server (Ctrl+C)
   # Then restart it
   npm run convex:dev
   ```
   
   **You MUST restart the Convex dev server** for the environment variables to be loaded.

## What These Keys Do

- **JWT_PRIVATE_KEY**: Used by Convex Auth to sign JWT tokens for user sessions
- **JWKS**: JSON Web Key Set containing the public key, used to verify tokens

## Important Notes

- These keys must be set in **Convex's environment variables**, not in `.env.local`
- The keys are deployment-specific - each Convex deployment needs its own keys
- Keep the private key secure - never commit it to version control
- If you lose the keys, you'll need to generate new ones (users will need to sign in again)

## Troubleshooting

### Error: "Missing environment variable `JWT_PRIVATE_KEY`"

This means the keys haven't been set in your Convex deployment yet. Follow the setup steps above.

### Keys Not Working After Setting

1. Make sure you copied the entire key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
2. **IMPORTANT**: The private key must have newlines preserved (not spaces). It must be in proper PKCS#8 PEM format
3. Restart your Convex dev server after setting the variables
4. Check the Convex dashboard to verify the variables are set correctly

### Error: "pkcs8" must be PKCS#8 formatted string

This error means the JWT_PRIVATE_KEY is not in the correct format or wasn't loaded. Check:

1. **Verify the key is set in Dashboard:**
   - Go to https://dashboard.convex.dev → Your Project → Settings → Environment Variables
   - Confirm `JWT_PRIVATE_KEY` exists and has a value

2. **Verify the key format:**
   - Must start with `-----BEGIN PRIVATE KEY-----` (NOT `-----BEGIN RSA PRIVATE KEY-----`)
   - Must be a single line with spaces (not newlines)
   - Must include `-----END PRIVATE KEY-----`
   - Should be about 1600-1700 characters long

3. **Restart Convex dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run convex:dev
   ```
   **This is critical** - Environment variables are only loaded when the server starts.

4. **If still failing:**
   - Generate new keys: `node generateKeys.mjs`
   - Delete the old `JWT_PRIVATE_KEY` in Dashboard
   - Add the new key from the script output
   - Restart Convex dev server again

## Production Setup

For production deployments:

1. Generate new keys (don't reuse development keys)
2. Set them in your production Convex deployment via the dashboard
3. The keys are automatically used by Convex Auth in production
