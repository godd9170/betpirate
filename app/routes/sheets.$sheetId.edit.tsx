import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // todo: check admin
  invariant(params.sheetId, `params.sheetId is required`);
  const sheet = await readSheet(params.sheetId);
  return json({ sheet });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  return "success";
};

export default () => {
  const { sheet } = useLoaderData<typeof loader>();
  return <>{JSON.stringify(sheet)}</>;
};
