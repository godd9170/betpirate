import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";
import {
  createSubmission,
  readSheetSubmission,
} from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";
import PropositionCard from "./components/PropositionCard";
import { useState } from "react";
import TiebreakerCard from "./components/TiebreakerCard";
import { z } from "zod";
import { parse } from "@conform-to/zod";

export const schema = z.object({
  selections: z.array(z.object({ optionId: z.string() })),
  tieBreaker: z.number(),
});

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

  const submissionParse = parse(form, { schema });

  invariant(!!submissionParse.value?.selections, "Missing selections");

  const submission = await createSubmission({
    sheetId: params.sheetId,
    sailorId,
    selections: submissionParse.value.selections,
    tieBreaker: submissionParse.value.tieBreaker,
  });
  return json({ submission });
};

export default function Sheet() {
  const { sheet } = useLoaderData<typeof loader>();
  const [selections, setSelections] = useState<object>({});
  const propositionCount = sheet.propositions.length;
  const selectionCount = Object.keys(selections).length;
  const disabled = propositionCount != selectionCount;
  return (
    <div className="h-screen">
      <Form method="post">
        {sheet?.propositions.map((proposition, index) => (
          <PropositionCard
            key={proposition.id}
            propositionIndex={index}
            proposition={proposition}
            onSelection={(propositionId: string, optionId: string) =>
              setSelections((prev) => ({ ...prev, [propositionId]: optionId }))
            }
          />
        ))}
        <TiebreakerCard tieBreakerQuestion={sheet.tieBreakerQuestion} />
        <footer className="sticky bottom-0">
          <progress
            className="progress sticky top-0"
            value={selectionCount}
            max={propositionCount}
          ></progress>
          <button
            className="btn btn-primary w-full mb-4"
            type="submit"
            disabled={disabled}
          >
            Submit your picks!
          </button>
        </footer>
      </Form>
    </div>
  );
}
