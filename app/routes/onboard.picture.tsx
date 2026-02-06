import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";
import ProfilePictureUpload from "~/components/ProfilePictureUpload";
import { readSailor, updateSailor } from "~/models/sailor.server";
import { readLatestSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";

export const schema = z.object({
  profilePictureUrl: z.string().optional(),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const sailor = await readSailor(sailorId);
  if (!sailor) return redirect("/login");

  // If user hasn't set username yet, redirect to step 1
  if (!sailor.username) {
    return redirect("/onboard");
  }

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
    profilePictureUrl: profilePictureUrl ? profilePictureUrl : null,
  });

  const latestSheet = await readLatestSheet();
  invariant(latestSheet, "No sheet exists");
  return redirect(`/sheets/${latestSheet.id}/submissions/new`);
};

export default function OnBoardPicture() {
  const { sailor, latestSheetId } = useLoaderData<typeof loader>();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    sailor.profilePictureUrl || null,
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card card-sm w-96 max-w-[90vw]">
        <Form
          className="flex flex-col space-y-4 card-body"
          action="/onboard/picture"
          method="post"
        >
          <div className="pt-6 text-center text-xl font-extrabold">
            Add yer picture, Matey
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

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={!profilePictureUrl}
          >
            Add a picture and proceed
          </button>

          <Link
            to={`/sheets/${latestSheetId}/submissions/new`}
            className="text-center text-sm text-base-content/60 hover:text-base-content"
          >
            nay, I be ashamed o' me appearance
          </Link>
        </Form>
      </div>
    </div>
  );
}
