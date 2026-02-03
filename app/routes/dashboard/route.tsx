import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  readLatestSheet,
  readSheet,
  readSheetDashboard,
} from "~/models/sheet.server";
import PropMatrix from "./components/PropMatrix";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const latestSheet = await readLatestSheet();
  invariant(latestSheet, "No sheet exists");
  const sheet = await readSheet(latestSheet.id);
  invariant(!!sheet, "No sheet exists with this id");

  const leaders = await readSheetDashboard(latestSheet.id);

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
