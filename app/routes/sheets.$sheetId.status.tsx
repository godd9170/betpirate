import { ActionFunctionArgs, json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import { updateSheet } from "~/models/sheet.server";

export const schema = z.object({
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]),
});

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId } = params;
  invariant(!!sheetId, "missing sheet id");
  const formData = await request.formData();
  const sheet = parseWithZod(formData, { schema });
  if (sheet.status !== 'success' || sheet.intent !== "submit") {
    return json(sheet);
  }
  await updateSheet(sheetId, sheet.value);
  return "success";
};
