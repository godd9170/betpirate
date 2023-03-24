import { json, LoaderArgs, ActionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";
import { createSubmission } from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";
import PropositionCard from "./components/PropositionCard";
import Button from "~/components/Button";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.sheetId, `params.sheetId is required`);
  const sheet = await readSheet(params.sheetId);
  return json({ sheet });
};

export const action = async ({ params, request }: ActionArgs) => {
  const sailor = await authenticator.isAuthenticated(request);
  invariant(sailor != null, `login to submit yer sheet`);
  invariant(params.sheetId, `params.sheetId is required`);
  const form = await request.formData();
  const submission = await createSubmission({
    sheetId: params.sheetId,
    sailorId: sailor.id,
    selections: _formToSelections(form),
  });
  return redirect(`/submissions/${submission.id}`);
};

const _formToSelections = (form: FormData) =>
  Array.from(form).map(([_, optionId]) => ({ optionId: optionId.toString() }));

export default () => {
  const { sheet } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="md:flex md:items-center md:justify-between mt-8 mb-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-slate sm:truncate sm:text-3xl sm:tracking-tight">
            {sheet?.title}
          </h2>
        </div>
      </div>
      <form method="post">
        <ol>
          {sheet?.propositions.map((proposition) => (
            <li key={proposition.id}>
              <PropositionCard proposition={proposition} />
            </li>
          ))}
        </ol>
        <Button type="submit">Lock it in</Button>
      </form>
    </>
  );
};
