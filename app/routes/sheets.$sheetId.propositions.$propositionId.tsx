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
  subtitle: z.string().optional(),
  shortTitle: z.string().optional(),
  imageUrl: z.string().optional(),
  options: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      shortTitle: z.string().optional(),
      imageUrl: z.string().optional(),
    }),
  ),
});

// extract the inferred type
// type PropositionForm = z.infer<typeof schema>;

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const normalizeImageUrl = (value?: string) =>
    value === undefined ? undefined : value.trim() ? value.trim() : null;

  const { sheetId, propositionId } = params;
  invariant(!!propositionId, "missing proposition id");
  const formData = await request.formData();
  const parsedForm = parseWithZod(formData, { schema });
  if (parsedForm.status !== "success") {
    return json(parsedForm);
  }
  const { options, imageUrl, ...proposition } = parsedForm.value;
  await updateProposition(propositionId, {
    ...proposition,
    // Only update when the field is present; preserve existing value otherwise.
    imageUrl: normalizeImageUrl(imageUrl),
  });

  // todo: there must be a way to do this nested, or we should
  // at least move this into the model
  await Promise.all(
    options.map(async ({ id, ...option }) => {
      const payload = {
        ...option,
        imageUrl: normalizeImageUrl(option.imageUrl),
      };
      if (!!id) return updatePropositionOption(id, payload);
      return createPropositionOption(propositionId, payload);
    }),
  );

  return "success";
};
