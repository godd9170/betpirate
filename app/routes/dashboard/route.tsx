import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet, readSheetDashboard } from "~/models/sheet.server";
import PropMatrix from "./components/PropMatrix";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sheetId = process.env.DEFAULT_SHEET_ID;
  invariant(sheetId, `sheetId is required`);

  const sheet = await readSheet(sheetId);
  invariant(!!sheet, "No sheet exists with this id");

  const leaders = await readSheetDashboard(sheetId);

  return json({ sheet, leaders });
};

export default function Dashboard() {
  const { sheet, leaders } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-300 p-6">
      <PropMatrix sheet={sheet} leaders={leaders} />
    </div>
  );
}
