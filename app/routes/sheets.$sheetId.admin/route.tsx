import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import StatusSelector from "./components/StatusSelector";
import EditSheet from "./components/EditSheet";
import MarkSheet from "./components/MarkSheet";
import SheetSchedule from "./components/SheetSchedule";
import { readSailor } from "~/models/sailor.server";
import Submissions from "./components/Submissions";
import { readSheetSubmissionsPaginated } from "~/models/submission.server";
import ClosedViewToggle from "./components/ClosedViewToggle";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(params.sheetId, `params.sheetId is required`);
  const sailor = await readSailor(sailorId);
  if (!sailor || !sailor.admin) return redirect("/");
  const sheet = await readSheet(params.sheetId);
  invariant(!!sheet, "No such sheet");

  // Parse URL search params for pagination and search
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(10, parseInt(url.searchParams.get("pageSize") || "25", 10))
  );
  const view = url.searchParams.get("view") || "answerKey"; // Default to answer key view

  const { submissions, total, paidCount } = await readSheetSubmissionsPaginated(
    {
      sheetId: params.sheetId,
      search: search || undefined,
      page,
      pageSize,
    }
  );

  return json({
    sheet,
    submissions,
    pagination: {
      page,
      pageSize,
      total,
      paidCount,
      totalPages: Math.ceil(total / pageSize),
      search,
    },
    view,
  });
};

// Allows designated 'admin' sailors to alter the sheet
export default function SheetEdit() {
  const { sheet, submissions, pagination, view } = useLoaderData<typeof loader>();
  const isClosed = sheet.status === "CLOSED";
  const showAnswerKey = view === "answerKey";

  return (
    <div className="min-h-[100dvh] bg-base-200">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-black">Sheet Admin</h1>
                <p className="text-sm text-base-content/70">
                  Build props, upload imagery, and manage submissions.
                </p>
              </div>
              <div className="w-full md:w-64">
                <StatusSelector sheet={sheet} />
              </div>
            </div>

            {/* View Toggle for CLOSED status */}
            {isClosed && <ClosedViewToggle currentView={view} />}
          </div>
        </div>

        {sheet.status === "DRAFT" && <SheetSchedule sheet={sheet} />}

        {sheet.status === "DRAFT" && <EditSheet sheet={sheet} />}

        {/* For CLOSED status, show either Answer Key or Submissions based on toggle */}
        {isClosed && showAnswerKey && <MarkSheet sheet={sheet} />}
        {isClosed && !showAnswerKey && (
          <Submissions submissions={submissions} pagination={pagination} />
        )}

        {/* For OPEN status, show only Submissions */}
        {sheet.status === "OPEN" && (
          <Submissions submissions={submissions} pagination={pagination} />
        )}
      </div>
    </div>
  );
}
