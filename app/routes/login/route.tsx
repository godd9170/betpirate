import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import PhoneNumberForm from "./components/PhoneNumberForm";
import { commitSession, sessionStorage } from "~/services/session.server";
import { readLatestSheet } from "~/models/sheet.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticator.authenticate("phone-number", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const latestSheet = await readLatestSheet();

  return json(
    {
      error: session.get(authenticator.sessionErrorKey),
      phone: session.get("auth:phone"),
      sheetTitle: latestSheet?.title ?? null,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session), // You must commit the session whenever you read a flash
      },
    }
  );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.sheetTitle ?? "Bet Pirate" }];
};

export default () => {
  let { error, sheetTitle } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PhoneNumberForm error={error} sheetTitle={sheetTitle} />
    </div>
  );
};
