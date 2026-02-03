import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { authenticator } from "~/services/auth.server";
import { readSailor } from "~/models/sailor.server";
import { reorderPropositions } from "~/models/proposition.server";

const schema = z.object({
  propositionId: z.string(),
  direction: z.enum(["up", "down"]),
});

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

  await reorderPropositions(sheetId, parsed.value.propositionId, parsed.value.direction);
  return json({ ok: true });
};
