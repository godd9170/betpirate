import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import LeaderBoard from "~/components/LeaderBoard";
import { readSheet, readSheetLeaders } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(sailorId, `sailorId is required`);

  const sheetId = params.sheetId;
  invariant(sheetId, `sheetId is required`);

  const sheet = await readSheet(sheetId);
  invariant(!!sheet, "No sheet exists with this id");

  if (sheet.status === "OPEN")
    return redirect(`/sheets/${sheetId}/submissions`);

  const leaders = await readSheetLeaders(sheetId);

  return json({ sheet, leaders });
};

export default function Sheet() {
  const { sheet, leaders } = useLoaderData<typeof loader>();
  if (sheet.status === "DRAFT") return <p>Sheets not ready</p>;

  return (
    <>
      <LeaderBoard sheet={sheet} leaders={leaders} />
    </>
  );
}
