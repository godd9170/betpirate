import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // set the username, emoji etc.
  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sailor = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json({ sailor });
};

export default () => {
  const { sailor } = useLoaderData<typeof loader>();
  return (
    <>
      <p>Okay {sailor.phone}, what be yer pirate name?</p>
    </>
  );
};
