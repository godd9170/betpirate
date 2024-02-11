import { ActionFunctionArgs, json } from "@remix-run/node";
import { parse } from "@conform-to/zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import { setSubmissionPaid } from "~/models/submission.server";

export const schema = z.object({
  isPaid: z.string().toLowerCase().transform(JSON.parse).pipe(z.boolean()),
});

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId, submissionId } = params;
  invariant(!!sheetId, "missing sheet id");
  invariant(!!submissionId, "missing submission id");
  const formData = await request.formData();
  const paidForm = parse(formData, { schema });

  if (!paidForm.value || paidForm.intent !== "submit") {
    return json(paidForm);
  }

  await setSubmissionPaid(submissionId, paidForm.value.isPaid);

  return "success";
};
