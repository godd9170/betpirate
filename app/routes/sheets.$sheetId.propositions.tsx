import { ActionFunctionArgs, json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { createProposition, getNextPropositionOrder } from "~/models/proposition.server";
import invariant from "tiny-invariant";

export const schema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  shortTitle: z.string().optional(),
  imageUrl: z.string().optional(),
  options: z.array(
    z.object({
      title: z.string(),
      shortTitle: z.string().optional(),
      imageUrl: z.string().optional(),
    })
  ),
});

// export type Proposition = z.infer<typeof schema>;

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId } = params;
  invariant(!!sheetId, "missing sheet id");
  const formData = await request.formData();
  const proposition = parseWithZod(formData, { schema });
  if (proposition.status !== 'success') {
    return json(proposition);
  }
  const nextOrder = await getNextPropositionOrder(sheetId);
  const { options, imageUrl, ...propositionValue } = proposition.value;
  await createProposition({
    sheetId,
    order: nextOrder,
    imageUrl: imageUrl?.trim() ? imageUrl.trim() : null,
    ...propositionValue,
    options: options.map((option) => ({
      ...option,
      imageUrl: option.imageUrl?.trim() ? option.imageUrl.trim() : null,
    })),
  });
  return json({ ok: true });
};
