import { ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  return await authenticator.logout(request, { redirectTo: "/login" });
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  return await authenticator.logout(request, { redirectTo: "/login" });
};
