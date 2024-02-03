import { ActionFunctionArgs, json } from "@remix-run/node";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { createProposition } from "~/models/proposition.server";
import invariant from "tiny-invariant";

export const schema = z.object({
  title: z.string(),
  subtitle: z.string(),
  shortTitle: z.string(),
  options: z.array(
    z.object({
      title: z.string(),
      shortTitle: z.string(),
    })
  ),
});

// export type Proposition = z.infer<typeof schema>;

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId } = params;
  invariant(!!sheetId, "missing sheet id");
  const formData = await request.formData();
  const proposition = parse(formData, { schema });
  if (!proposition.value || proposition.intent !== "submit") {
    return json(proposition);
  }
  await createProposition({ sheetId, ...proposition.value });
  return "success";
};
