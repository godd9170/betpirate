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
import { readSheetSubmissions } from "~/models/submission.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(params.sheetId, `params.sheetId is required`);
  const sailor = await readSailor(sailorId);
  if (!sailor || !sailor.admin) return redirect("/");
  const sheet = await readSheet(params.sheetId);
  const submissions = await readSheetSubmissions(params.sheetId);
  invariant(!!sheet, "No such sheet");
  return json({ sheet, submissions });
};

// Allows designated 'admin' sailors to alter the sheet
export default function SheetEdit() {
  const { sheet, submissions } = useLoaderData<typeof loader>();
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
          </div>
        </div>

        {sheet.status === "DRAFT" && <SheetSchedule sheet={sheet} />}

        {sheet.status === "DRAFT" && <EditSheet sheet={sheet} />}
        {sheet.status === "CLOSED" && <MarkSheet sheet={sheet} />}
        {sheet.status !== "DRAFT" && <Submissions submissions={submissions} />}
      </div>
    </div>
  );
}
