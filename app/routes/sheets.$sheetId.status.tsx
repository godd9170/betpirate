import { ActionFunctionArgs, json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import { updateSheet } from "~/models/sheet.server";

export const schema = z.object({
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).optional(),
  closesAt: z.preprocess(
    (value) => {
      // Field not in form data → don't update
      if (value === null || value === undefined) return undefined;
      // Explicitly empty → clear the field
      if (value === "") return null;
      // Parse date string
      if (typeof value === "string") {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
      }
      return value;
    },
    z.date().nullable().optional()
  ),
});

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId } = params;
  invariant(!!sheetId, "missing sheet id");
  const formData = await request.formData();
  const sheet = parseWithZod(formData, { schema });
  if (sheet.status !== "success") {
    return json(sheet);
  }
  // Filter out undefined values so Prisma doesn't update those fields
  const updateData = Object.fromEntries(
    Object.entries(sheet.value).filter(([_, value]) => value !== undefined)
  );
  await updateSheet(sheetId, updateData);
  return "success";
};
