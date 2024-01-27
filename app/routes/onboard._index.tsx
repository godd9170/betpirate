import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSailor, updateSailor } from "~/models/sailor.server";
import { authenticator } from "~/services/auth.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const form = await request.formData();
  const username = form.get("username");

  invariant(username != null, `missing username`);
  invariant(typeof username === "string", "username must be string");
  invariant(username !== "", "username must not be empty");

  await updateSailor(sailorId, { username });

  return redirect(`/`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const sailor = await readSailor(sailorId);
  if (!sailor) return redirect("/login");
  return json({ sailor });
};

export default () => {
  const { sailor } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Welcome Aboard {sailor.phone}!</h1>
      <p>Okay, what be yer pirate name?</p>
      <Form className="space-y-6" action="/onboard?index" method="post">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Username
          </label>
          <div className="mt-2">
            <input name="username" type="text" />
          </div>
        </div>
      </Form>
    </>
  );
};
