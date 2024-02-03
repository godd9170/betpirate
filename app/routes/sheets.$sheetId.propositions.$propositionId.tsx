import { ActionFunctionArgs, json } from "@remix-run/node";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import { updateProposition } from "~/models/proposition.server";
import invariant from "tiny-invariant";

export const schema = z.object({
  title: z.string(),
  subtitle: z.string(),
  shortTitle: z.string(),
});

// extract the inferred type
// type PropositionForm = z.infer<typeof schema>;

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId, propositionId } = params;
  invariant(!!propositionId, "missing proposition id");
  const formData = await request.formData();
  const proposition = parse(formData, { schema });
  if (!proposition.value || proposition.intent !== "submit") {
    return json(proposition);
  }
  await updateProposition(propositionId, proposition.value);
  return "success";
};
