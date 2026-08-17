import { NextRequest, NextResponse } from "next/server";
import { importExternalJob } from "@/features/ai-job-import/api/import-external-job.server";
import { parseImportRequest } from "@/features/ai-job-import/model/parse-import-request";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function hasValidImportSecret(request: NextRequest) {
  const secret = process.env.AI_IMPORT_SECRET;
  return Boolean(
    secret && request.headers.get("authorization") === `Bearer ${secret}`,
  );
}

export async function POST(request: NextRequest) {
  if (!hasValidImportSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = parseImportRequest(await request.json());
    const results = await Promise.all(
      payload.listings.map((listing) =>
        importExternalJob(payload.source, listing),
      ),
    );
    return NextResponse.json({
      imported: results.filter((result) => result === "queued").length,
      needsDetails: results.filter((result) => result === "needs_details")
        .length,
      duplicates: results.filter((result) => result === "duplicate").length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "AI import bajarilmadi",
      },
      { status: 400 },
    );
  }
}
