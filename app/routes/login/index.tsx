import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import PhoneNumberForm from "./components/PhoneNumberForm";
import MagicLinkConfirmation from "./components/MagicLinkConfirmation";
import { sessionStorage } from "~/services/session.server";

export const action = async ({ request }: ActionArgs) => {
  // The success redirect is required in this action, this is where the user is
  // going to be redirected after the magic link is sent, note that here the
  // user is not yet authenticated, so you can't send it to a private page.
  await authenticator.authenticate("sms-link", request, {
    successRedirect: "/login",
    failureRedirect: "/login",
  });
};

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.isAuthenticated(request, { successRedirect: "/sheets" });
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return json({
    magicLinkSent: session.has("auth:magiclink"),
    magicLinkPhone: session.get("auth:phone"),
  });
};

export default () => {
  let { magicLinkSent, magicLinkPhone } = useLoaderData<typeof loader>();
  return magicLinkSent ? (
    <MagicLinkConfirmation phone={magicLinkPhone} />
  ) : (
    <PhoneNumberForm />
  );
};
