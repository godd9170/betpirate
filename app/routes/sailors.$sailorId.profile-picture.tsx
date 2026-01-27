import { LoaderFunctionArgs } from "@remix-run/node";
import { readSailor } from "~/models/sailor.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { sailorId } = params;

  if (!sailorId) {
    throw new Response("Sailor ID required", { status: 400 });
  }

  const sailor = await readSailor(sailorId);

  if (!sailor?.profilePicture) {
    throw new Response("Profile picture not found", { status: 404 });
  }

  return new Response(sailor.profilePicture, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
