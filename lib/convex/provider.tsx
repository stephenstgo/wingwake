"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create client only if URL is available
let convex: ConvexReactClient | null = null;

if (convexUrl) {
  convex = new ConvexReactClient(convexUrl);
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // If Convex URL is not configured, show helpful error message
  if (!convexUrl || !convex) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Convex Configuration Required
          </h1>
          <p className="text-gray-600 mb-4">
            The <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_CONVEX_URL</code> environment variable is not set.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">Setup Instructions:</p>
            <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
              <li>Run <code className="bg-blue-100 px-1 rounded">npx convex dev</code> in your terminal</li>
              <li>Copy the deployment URL provided</li>
              <li>Add it to your <code className="bg-blue-100 px-1 rounded">.env.local</code> file:</li>
            </ol>
            <pre className="mt-2 text-xs bg-blue-100 p-2 rounded overflow-x-auto">
              NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
            </pre>
            <li className="text-sm text-blue-800 mt-2">Restart your Next.js development server</li>
          </div>
          <p className="text-xs text-gray-500">
            See <code className="bg-gray-100 px-1 rounded">CONVEX_MIGRATION.md</code> for detailed migration instructions.
          </p>
        </div>
      </div>
    );
  }

  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
