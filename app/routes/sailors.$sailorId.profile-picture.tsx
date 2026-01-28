import { LoaderFunctionArgs } from "@remix-run/node";
import { readSailor } from "~/models/sailor.server";
import fs from "node:fs/promises";
import path from "node:path";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { sailorId } = params;

  if (!sailorId) {
    throw new Response("Sailor ID required", { status: 400 });
  }

  const sailor = await readSailor(sailorId);

  if (!sailor?.profilePicture) {
    const fallbackPath = path.resolve(process.cwd(), "app/public/pirate.png");
    const fallback = await fs.readFile(fallbackPath);

    return new Response(fallback, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  return new Response(sailor.profilePicture, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
