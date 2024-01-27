import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import PhoneNumberForm from "./components/PhoneNumberForm";
import MagicLinkConfirmation from "./components/MagicLinkConfirmation";
import { commitSession, sessionStorage } from "~/services/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticator.authenticate("sms-link", request, {
    successRedirect: "/login",
    failureRedirect: "/login",
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));

  return json(
    {
      error: session.get(authenticator.sessionErrorKey),
      magicLinkSent: session.has("auth:magiclink"),
      magicLinkPhone: session.get("auth:phone"),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session), // You must commit the session whenever you read a flash
      },
    }
  );
};

export default () => {
  let { error, magicLinkSent, magicLinkPhone } = useLoaderData<typeof loader>();
  return magicLinkSent ? (
    <MagicLinkConfirmation phone={magicLinkPhone} />
  ) : (
    <PhoneNumberForm error={error} />
  );
};
