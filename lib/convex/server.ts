import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const authToken = process.env.CONVEX_AUTH_TOKEN;

// Lazy initialization - only create client when actually used
let _convexClient: ConvexHttpClient | undefined;

function getClient(): ConvexHttpClient {
  if (!_convexClient) {
    if (!convexUrl) {
      throw new Error(
        "Missing NEXT_PUBLIC_CONVEX_URL environment variable.\n\n" +
        "To fix this:\n" +
        "1. Run: npx convex dev\n" +
        "2. Copy the deployment URL\n" +
        "3. Add it to .env.local: NEXT_PUBLIC_CONVEX_URL=https://your-url.convex.cloud\n" +
        "4. Restart your Next.js server\n\n" +
        "See SETUP_CONVEX.md for detailed instructions."
      );
    }
    _convexClient = new ConvexHttpClient(convexUrl);
    if (authToken) {
      _convexClient.setAuth(authToken);
    }
  }
  return _convexClient;
}

// Export client with lazy initialization
export const convexClient = new Proxy({} as ConvexHttpClient, {
  get(_target, prop) {
    const client = getClient();
    const value = client[prop as keyof ConvexHttpClient];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export { api };
