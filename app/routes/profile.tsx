import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import ProfilePictureUpload from "~/components/ProfilePictureUpload";
import { readSailor, updateSailor } from "~/models/sailor.server";
import { readLatestSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import { IoArrowBack } from "react-icons/io5";

export const schema = z.object({
  username: z.string().min(1, "Username is required"),
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

  const latestSheet = await readLatestSheet();
  invariant(latestSheet, "No sheet exists");

  return json({
    sailor: {
      ...sailor,
      profilePictureUrl: sailor.profilePictureUrl ?? null,
    },
    latestSheetId: latestSheet.id,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
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

  // Redirect back to where they came from, or to the latest sheet
  const referer = request.headers.get("referer");
  if (referer && !referer.includes("/profile")) {
    return redirect(referer);
  }

  const latestSheet = await readLatestSheet();
  invariant(latestSheet, "No sheet exists");
  return redirect(`/sheets/${latestSheet.id}`);
};

export default function Profile() {
  const { sailor, latestSheetId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    sailor.profilePictureUrl || null,
  );
  const [username, setUsername] = useState<string>(sailor.username || "");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="card w-96 max-w-[90vw] bg-base-100 shadow-xl">
        <Form className="flex flex-col space-y-4 card-body" method="post">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              <IoArrowBack size={20} />
            </button>
            <h2 className="text-xl font-extrabold">Edit Profile</h2>
            <div className="w-10"></div>
          </div>

          <div className="divider my-0"></div>

          <div className="text-center text-sm font-semibold">
            Profile Picture
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

          <div className="divider my-0"></div>

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
            Pirate Name
            <span className="text-xs font-normal text-base-content/60 ml-1">
              (appears on leaderboard)
            </span>
            <input
              name="username"
              type="text"
              className="input input-bordered w-full placeholder:text-base-content/40 placeholder:italic"
              placeholder="Pirate name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!username}
          >
            Save Changes
          </button>

          <Link
            to={`/sheets/${latestSheetId}`}
            className="text-center text-sm text-base-content/60 hover:text-base-content"
          >
            Cancel
          </Link>

          <div className="divider my-2"></div>

          <Form action="/logout" method="post" className="text-center">
            <button
              type="submit"
              className="text-sm text-base-content/60 hover:text-error transition-colors cursor-pointer"
            >
              Logout
            </button>
          </Form>
        </Form>
      </div>
    </div>
  );
}
