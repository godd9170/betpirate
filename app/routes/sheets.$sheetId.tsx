import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";
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

  return json({ sheet });
};

export default function Sheet() {
  const { sheet } = useLoaderData<typeof loader>();
  return (
    <div>
      <Link to={`/sheets/${sheet.id}`}>
        <h1 className="text-xl font-black text-center">{sheet.title}</h1>
      </Link>
      <Outlet />
    </div>
  );
}
