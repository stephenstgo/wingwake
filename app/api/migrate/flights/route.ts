import { NextResponse } from "next/server";
import { convexClient, api } from "@/lib/convex/server";

/**
 * @deprecated This endpoint is for migrating data from Supabase to Convex.
 * If you've already migrated or are using Convex from the start, you don't need this.
 * 
 * To use this migration:
 * 1. Install Supabase: npm install @supabase/supabase-js
 * 2. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment
 * 3. Call this endpoint to migrate your data
 */
export async function POST() {
  try {
    // Check if Supabase credentials are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: "Migration not available",
          message: "Supabase credentials not found. This migration is only needed if you're migrating from Supabase.",
          note: "If you're starting fresh with Convex, use /api/seed/example-data instead to create example data.",
        },
        { status: 400 }
      );
    }

    // Pass Supabase credentials to the action
    const result = await convexClient.action(
      api["actions/migrateFlights"].migrateFlightsFromSupabase,
      {
        supabaseUrl,
        supabaseKey,
      }
    );

    return NextResponse.json({
      success: result.success,
      migrated: result.migrated,
      totalErrors: result.errors.length,
      errors: result.errors,
      message: `Successfully migrated ${result.migrated} flights from Supabase to Convex.`,
    });
  } catch (error) {
    console.error("Migration error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Provide helpful error message if Supabase is not installed
    if (errorMessage.includes("Supabase client not available")) {
      return NextResponse.json(
        {
          error: "Migration not available",
          details: errorMessage,
          note: "To use this migration, install @supabase/supabase-js: npm install @supabase/supabase-js",
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        error: "Migration failed",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
