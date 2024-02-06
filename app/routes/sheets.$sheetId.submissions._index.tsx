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
import { createPortal } from "react-dom";

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
  const selections = _formToSelections(form);
  const submission = await createSubmission({
    sheetId: params.sheetId,
    sailorId,
    selections,
  });
  return json({ submission });
};

// todo: use zod to convert this to a writable sheet
const _formToSelections = (form: FormData) =>
  Array.from(form).map(([_, optionId]) => ({ optionId: optionId.toString() }));

export default function Sheet() {
  const { sheet } = useLoaderData<typeof loader>();
  return (
    <div className="h-screen">
      <Form method="post">
        {sheet?.propositions.map((proposition) => (
          <PropositionCard key={proposition.id} proposition={proposition} />
        ))}
        <footer className="sticky bottom-0">
          <button className="btn btn-primary w-full mb-4" type="submit">
            Lock it in
          </button>
        </footer>
      </Form>
    </div>
  );
}
