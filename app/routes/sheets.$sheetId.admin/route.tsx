import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import StatusSelector from "./components/StatusSelector";
import EditSheet from "./components/EditSheet";
import MarkSheet from "./components/MarkSheet";
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
    <>
      <StatusSelector sheet={sheet} />
      {sheet.status === "DRAFT" && <EditSheet sheet={sheet} />}
      {sheet.status === "OPEN" && <Submissions submissions={submissions} />}
      {sheet.status === "CLOSED" && (
        <>
          <MarkSheet sheet={sheet} />
          <Submissions submissions={submissions} />
        </>
      )}
    </>
  );
}
