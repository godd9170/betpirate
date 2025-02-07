import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sheetId = process.env.DEFAULT_SHEET_ID;
  invariant(sheetId, `sheetId is required`);

  const sheet = await readSheet(sheetId);
  invariant(!!sheet, "No sheet exists with this id");

  return json({ sheet });
};

export default function Dashboard() {
  const { sheet } = useLoaderData<typeof loader>();
  return sheet.propositions.map((proposition) => (
    <div>{proposition.title}</div>
  ));
}
