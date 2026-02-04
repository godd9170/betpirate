import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { readSailor } from "~/models/sailor.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { sailorId } = params;

  if (!sailorId) {
    throw new Response("Sailor ID required", { status: 400 });
  }

  const sailor = await readSailor(sailorId);

  if (!sailor?.profilePicture) {
    return redirect("/fallback-avatar.svg");
  }

  return new Response(sailor.profilePicture, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
