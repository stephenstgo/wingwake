import { NextResponse } from "next/server";
import { convexClient, api } from "@/lib/convex/server";

export async function POST() {
  try {
    // Run the seed action
    const result = await convexClient.action(
      api["actions/seedExampleData"].seedExampleData,
      {}
    );

    return NextResponse.json({
      success: result.success,
      created: result.created,
      totalErrors: result.errors.length,
      errors: result.errors,
      message: `Successfully created example data: ${JSON.stringify(result.created)}`,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        error: "Seed failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
