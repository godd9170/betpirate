import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import PhoneNumberForm from "./components/PhoneNumberForm";
import { commitSession, sessionStorage } from "~/services/session.server";
import Logo from "~/components/Logo";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticator.authenticate("phone-number", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));

  return json(
    {
      error: session.get(authenticator.sessionErrorKey),
      phone: session.get("auth:phone"),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session), // You must commit the session whenever you read a flash
      },
    }
  );
};

export default () => {
  let { error } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="h-24 w-96">
        <Logo />
      </div>
      <PhoneNumberForm error={error} />
    </div>
  );
};
