import { ActionFunctionArgs, json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  createPropositionOption,
  updateProposition,
  updatePropositionOption,
} from "~/models/proposition.server";
import invariant from "tiny-invariant";

export const schema = z.object({
  title: z.string(),
  subtitle: z.string(),
  shortTitle: z.string(),
  options: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      shortTitle: z.string(),
    })
  ),
});

// extract the inferred type
// type PropositionForm = z.infer<typeof schema>;

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId, propositionId } = params;
  invariant(!!propositionId, "missing proposition id");
  const formData = await request.formData();
  const parsedForm = parseWithZod(formData, { schema });
  if (parsedForm.status !== 'success' || parsedForm.intent !== "submit") {
    return json(parsedForm);
  }
  const { options, ...proposition } = parsedForm.value;
  await updateProposition(propositionId, proposition);

  // todo: there must be a way to do this nested, or we should
  // at least move this into the model
  await options.forEach(async ({ id, ...option }) => {
    if (!!id) await updatePropositionOption(id, option);
    else await createPropositionOption(propositionId, option);
  });

  return "success";
};
