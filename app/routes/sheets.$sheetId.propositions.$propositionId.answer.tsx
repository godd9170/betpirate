import { ActionFunctionArgs, json } from "@remix-run/node";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import { updateProposition } from "~/models/proposition.server";

export const schema = z.object({
  answerId: z.string().nullable(),
});

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId, propositionId } = params;
  invariant(!!sheetId, "missing sheet id");
  invariant(!!propositionId, "missing proposition id");
  const formData = await request.formData();
  const answer = parse(formData, { schema });
  console.log("ANSWERRR!!!!!!!!!!!!!!!", answer);
  if (!answer.value || answer.intent !== "submit") {
    return json(answer);
  }

  if (answer.value.answerId === "-") {
    // todo: this is a hack.. whats a better way to clear?
    await updateProposition(propositionId, { answerId: null });
  } else {
    await updateProposition(propositionId, answer.value);
  }

  return "success";
};
