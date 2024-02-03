import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { readSailor, updateSailor } from "~/models/sailor.server";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const sailor = await readSailor(sailorId);
  if (!sailor) return redirect("/login");
  return json({ sailor });
};

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

export default function OnBoard() {
  const { sailor } = useLoaderData<typeof loader>();
  const [username, setUsername] = useState<string>();
  return (
    <Form
      className="flex flex-col space-y-4"
      action="/onboard?index"
      method="post"
    >
      <h1 className="text-xl text-center font-black pt-12">Ahoy!</h1>
      <p className="pt-6 text-center">What be yer pirate name?</p>
      <input
        name="username"
        type="text"
        className="input input-bordered w-full"
        placeholder="barnmucker69"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={!username}
      >
        Let's go!
      </button>
    </Form>
  );
}
