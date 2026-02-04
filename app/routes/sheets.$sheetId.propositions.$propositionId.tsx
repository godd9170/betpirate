import { ActionFunctionArgs, json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  createPropositionOption,
  deletePropositionOptions,
  readPropositionOptionIds,
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
  const existing = await readPropositionOptionIds(propositionId);
  const existingOptionIds = existing?.options.map((option) => option.id) ?? [];
  const submittedOptionIds = options
    .map((option) => option.id)
    .filter((id): id is string => Boolean(id));
  const removedOptionIds = existingOptionIds.filter(
    (id) => !submittedOptionIds.includes(id),
  );
  const shouldClearAnswer =
    existing?.answerId && removedOptionIds.includes(existing.answerId);

  await updateProposition(propositionId, {
    ...proposition,
    // Only update when the field is present; preserve existing value otherwise.
    imageUrl: normalizeImageUrl(imageUrl),
    ...(shouldClearAnswer ? { answerId: null } : {}),
  });

  // todo: there must be a way to do this nested, or we should
  // at least move this into the model
  await Promise.all(
    options.map(async ({ id, ...option }, index) => {
      const payload = {
        ...option,
        imageUrl: normalizeImageUrl(option.imageUrl),
        order: index + 1,
      };
      if (!!id) return updatePropositionOption(id, payload);
      return createPropositionOption(propositionId, payload);
    }),
  );

  await deletePropositionOptions(removedOptionIds);

  return "success";
};
