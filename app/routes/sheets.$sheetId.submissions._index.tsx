import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet, readSheetWithSubmissions } from "~/models/sheet.server";
import {
  createSubmission,
  readSheetSubmission,
} from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";
import PropositionCard from "~/components/PropositionCard";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(!!sailorId, `sailorId is required`);

  const sheetId = params.sheetId;
  invariant(sheetId, `params.sheetId is required`);

  const submission = await readSheetSubmission(sheetId, sailorId);
  if (!!submission)
    return redirect(`/sheets/${sheetId}/submissions/${submission.id}`);

  const sheet = await readSheet(sheetId);
  invariant(!!sheet, `no sheet found`);

  if (sheet.status === "CLOSED") return redirect(`/sheets/${sheetId}`);

  return json({ sheet });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request);
  invariant(sailorId != null, `login to submit yer sheet`);
  invariant(params.sheetId, `params.sheetId is required`);
  const form = await request.formData();
  Array.from(form).forEach((e) => console.log("E: ", e));
  const selections = _formToSelections(form);
  console.log("SELECTIONS: ", selections);
  const submission = await createSubmission({
    sheetId: params.sheetId,
    sailorId,
    selections,
  });
  return json({ submission });
};

const _formToSelections = (form: FormData) =>
  Array.from(form).map(([_, optionId]) => ({ optionId: optionId.toString() }));

export default function Sheet() {
  const { sheet } = useLoaderData<typeof loader>();
  return (
    <Form method="post">
      {sheet?.propositions.map((proposition) => (
        <PropositionCard key={proposition.id} proposition={proposition} />
      ))}
      <button className="btn btn-primary w-full" type="submit">
        Lock it in
      </button>
    </Form>
  );
}
