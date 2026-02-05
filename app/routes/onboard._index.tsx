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
import ProfilePictureUpload from "~/components/ProfilePictureUpload";
import { readSailor, updateSailor } from "~/models/sailor.server";
import { readLatestSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";

export const schema = z.object({
  username: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePictureUrl: z.string().optional(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const sailor = await readSailor(sailorId);
  if (!sailor) return redirect("/login");

  return json({
    sailor: {
      ...sailor,
      profilePictureUrl: sailor.profilePictureUrl ?? null,
    },
  });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const formData = await request.formData();
  const sailorForm = parseWithZod(formData, { schema });

  invariant(sailorForm.status === "success", `missing required parameters`);

  const profilePictureUrl = sailorForm.value.profilePictureUrl?.trim();

  await updateSailor(sailorId, {
    username: sailorForm.value.username,
    firstName: sailorForm.value.firstName,
    lastName: sailorForm.value.lastName,
    profilePictureUrl: profilePictureUrl ? profilePictureUrl : null,
  });

  const latestSheet = await readLatestSheet();
  invariant(latestSheet, "No sheet exists");
  return redirect(`/sheets/${latestSheet.id}/submissions/new`);
};

export default function OnBoard() {
  const { sailor } = useLoaderData<typeof loader>();
  const [username, setUsername] = useState<string>(sailor.username || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    sailor.profilePictureUrl || null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card card-sm w-96 max-w-[90vw]">
        <Form
          className="flex flex-col space-y-4 card-body"
          action="/onboard?index"
          method="post"
        >
          <div className="pt-6 text-center text-xl font-extrabold">
            We be needin' some details before we set sail Matey
          </div>

          <ProfilePictureUpload
            onImageChange={setProfilePictureUrl}
            currentImage={sailor.profilePictureUrl}
          />
          <input
            type="hidden"
            name="profilePictureUrl"
            value={profilePictureUrl || ""}
          />

          <fieldset className="flex w-full gap-2">
            <label className="w-full text-sm font-semibold">
              First Name
              <input
                name="firstName"
                type="text"
                className="input input-bordered w-full placeholder:text-base-content/40 placeholder:italic"
                placeholder="First name"
                defaultValue={sailor.firstName || ""}
              />
            </label>
            <label className="w-full text-sm font-semibold">
              Last Name
              <input
                name="lastName"
                type="text"
                className="input input-bordered w-full placeholder:text-base-content/40 placeholder:italic"
                placeholder="Last name"
                defaultValue={sailor.lastName || ""}
              />
            </label>
          </fieldset>
          <label className="w-full text-sm font-semibold">
            Pirate Name - This be yer name on the leaderboard
            <input
              name="username"
              type="text"
              className="input input-bordered w-full placeholder:text-base-content/40 placeholder:italic"
              placeholder="Pirate name"
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
