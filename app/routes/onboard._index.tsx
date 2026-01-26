import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import { readSailor, updateSailor } from "~/models/sailor.server";
import { authenticator } from "~/services/auth.server";

export const schema = z.object({
  username: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

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

  const formData = await request.formData();
  const sailorForm = parseWithZod(formData, { schema });

  invariant(sailorForm.status === 'success', `missing required parameters`);

  await updateSailor(sailorId, sailorForm.value);

  return redirect(`/sheets/${process.env.DEFAULT_SHEET_ID}/submissions/new`);
};

export default function OnBoard() {
  const { sailor } = useLoaderData<typeof loader>();
  const [username, setUsername] = useState<string>();
  return (
    <div className="container mx-auto">
      <div className="card card-sm">
        <Form
          className="flex flex-col space-y-4 card-body"
          action="/onboard?index"
          method="post"
        >
          <div className="pt-6 text-center text-xl font-extrabold">
            We be needin' some details before we set sail Matey
          </div>
          <fieldset className="flex w-full gap-2">
            <label className="w-full">
              First Name
              <input
                name="firstName"
                type="text"
                className="input input-bordered w-full"
                placeholder="Jamaal"
              />
            </label>
            <label className="w-full">
              Last Name
              <input
                name="lastName"
                type="text"
                className="input input-bordered w-full"
                placeholder="Williams"
              />
            </label>
          </fieldset>
          <label className="w-full">
            Pirate Name - This be yer name on the leaderboard
            <input
              name="username"
              type="text"
              className="input input-bordered w-full"
              placeholder="barnmucker69"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!username}
          >
            Let's go!
          </button>
        </Form>
      </div>
    </div>
  );
}
