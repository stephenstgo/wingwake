# Setting JWT Keys for Convex Auth

The CLI method may not preserve the key format correctly. **Use the Convex Dashboard instead.**

## Step-by-Step Instructions

1. **Generate the keys:**
   ```bash
   node generateKeys.mjs
   ```

2. **Copy the output** - You'll see two lines:
   - `JWT_PRIVATE_KEY="..."`
   - `JWKS="..."`

3. **Set via Convex Dashboard (RECOMMENDED):**
   - Go to https://dashboard.convex.dev
   - Select your project
   - Navigate to **Settings** → **Environment Variables**
   - Click **Add Variable**
   - **Variable name**: `JWT_PRIVATE_KEY`
   - **Value**: Copy the value from the script output (the part inside the quotes, starting with `-----BEGIN PRIVATE KEY-----`)
   - Click **Save**
   - Click **Add Variable** again
   - **Variable name**: `JWKS`
   - **Value**: Copy the JWKS value from the script output (the JSON string)
   - Click **Save**

4. **Restart your Convex dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run convex:dev
   ```

## Why Dashboard Instead of CLI?

The Convex CLI has known issues with multi-line or long environment variables. The Dashboard handles the single-line format correctly.

## Verify Keys Are Set

After setting in the Dashboard, restart your Convex dev server and try signing in. The error should be resolved.

## Troubleshooting

If you still get the error after using the Dashboard:
1. Verify the key starts with `-----BEGIN PRIVATE KEY-----` (not `-----BEGIN RSA PRIVATE KEY-----`)
2. Verify it's a single line with spaces (not newlines)
3. Make sure you restarted the Convex dev server
4. Check the Convex Dashboard to confirm both variables are set
