import { createCsv } from "@/server/export/safe-csv";
import { getSubmissionExportData } from "@/server/services/submissions.service";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  try {
    const data = await getSubmissionExportData({
      resource: searchParams.get("resource") ?? "contact",
      query: searchParams.get("query") || undefined,
      status: searchParams.get("status") || undefined,
      campaignId: searchParams.get("campaignId") || undefined,
    });
    const csv = createCsv(data.headers, data.rows);

    return new Response(`\uFEFF${csv}`, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${data.filename}"`,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    const status =
      typeof error === "object"
      && error !== null
      && "statusCode" in error
      && typeof error.statusCode === "number"
        ? error.statusCode
        : 500;
    return Response.json(
      { error: status === 500 ? "Không thể export dữ liệu." : "Yêu cầu export không hợp lệ." },
      { status, headers: { "cache-control": "no-store" } },
    );
  }
}
