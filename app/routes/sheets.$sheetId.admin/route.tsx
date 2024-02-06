import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import StatusSelector from "./components/StatusSelector";
import EditSheet from "./components/EditSheet";
import MarkSheet from "./components/MarkSheet";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(params.sheetId, `params.sheetId is required`);
  // todo: redirect if not an admin
  const sheet = await readSheet(params.sheetId);
  invariant(!!sheet, "No such sheet");
  return json({ sheet });
};

export default function SheetEdit() {
  const { sheet } = useLoaderData<typeof loader>();
  return (
    <>
      <StatusSelector sheet={sheet} />
      {sheet.status === "DRAFT" && <EditSheet sheet={sheet} />}
      {sheet.status === "OPEN" && <span>Currently accepting submissions</span>}
      {sheet.status === "CLOSED" && <MarkSheet sheet={sheet} />}
    </>
  );
}
