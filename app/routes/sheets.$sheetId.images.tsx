import { ActionFunctionArgs, json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import crypto from "node:crypto";
import { authenticator } from "~/services/auth.server";
import { readSailor } from "~/models/sailor.server";
import { createPresignedUploadUrl } from "~/utils/storage.server";

const schema = z.object({
  contentType: z.string(),
  fileName: z.string().optional(),
});

const allowedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const contentTypeToExtension = (contentType: string) => {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/jpeg":
    default:
      return "jpg";
  }
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const sailor = await readSailor(sailorId);
  if (!sailor || !sailor.admin) {
    return new Response("Unauthorized", { status: 403 });
  }

  const sheetId = params.sheetId;
  invariant(sheetId, "missing sheet id");

  const formData = await request.formData();
  const parsed = parseWithZod(formData, { schema });
  if (parsed.status !== "success") {
    return json(parsed, { status: 400 });
  }

  const contentType = parsed.value.contentType;
  if (!allowedContentTypes.has(contentType)) {
    return json({ error: "Unsupported image type" }, { status: 400 });
  }

  const extension = contentTypeToExtension(contentType);
  const token = crypto.randomBytes(12).toString("hex");
  const key = `sheets/${sheetId}/${Date.now()}-${token}.${extension}`;

  const { uploadUrl, publicUrl } = await createPresignedUploadUrl({
    key,
    contentType,
  });

  return json({ uploadUrl, publicUrl, key });
};
