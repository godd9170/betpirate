import { ActionFunctionArgs, json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import crypto from "node:crypto";
import { authenticator } from "~/services/auth.server";
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

export const action = async ({ request }: ActionFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

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
  const key = `sailors/${sailorId}/${Date.now()}-${token}.${extension}`;

  const { uploadUrl, publicUrl } = await createPresignedUploadUrl({
    key,
    contentType,
  });

  return json({ uploadUrl, publicUrl, key });
};
