import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import invariant from "tiny-invariant";
import { useRef, useState } from "react";
import { authenticator } from "~/services/auth.server";
import { readSheet, readOptionSelectionCounts } from "~/models/sheet.server";
import { readSubmission, updateSubmission } from "~/models/submission.server";
import ProgressBar from "~/routes/sheets.$sheetId.submissions.new/components/ProgressBar";
import PropositionCard from "~/routes/sheets.$sheetId.submissions.new/components/PropositionCard";
import TiebreakerCard from "~/routes/sheets.$sheetId.submissions.new/components/TiebreakerCard";

export const schema = z.object({
  selections: z.array(z.object({ optionId: z.string() })),
  tieBreaker: z.number(),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(!!sailorId, "sailorId is required");
  invariant(params.sheetId, "params.sheetId is required");
  invariant(params.submissionId, "params.submissionId is required");

  const [sheet, submission] = await Promise.all([
    readSheet(params.sheetId),
    readSubmission(params.submissionId),
  ]);

  if (
    !sheet ||
    !submission ||
    submission.sheetId !== params.sheetId ||
    submission.sailorId !== sailorId
  ) {
    throw new Response("Not found", { status: 404 });
  }

  if (sheet.status === "CLOSED") {
    return redirect(
      `/sheets/${params.sheetId}/submissions/${params.submissionId}?edit=closed`
    );
  }

  const optionCounts = await readOptionSelectionCounts(params.sheetId);

  return json({ sheet, submission, optionCounts });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(!!sailorId, "sailorId is required");
  invariant(params.sheetId, "params.sheetId is required");
  invariant(params.submissionId, "params.submissionId is required");

  const submission = await readSubmission(params.submissionId);

  if (
    !submission ||
    submission.sheetId !== params.sheetId ||
    submission.sailorId !== sailorId
  ) {
    throw new Response("Not found", { status: 404 });
  }

  if (submission.sheet.status === "CLOSED") {
    return redirect(
      `/sheets/${params.sheetId}/submissions/${params.submissionId}?edit=closed`
    );
  }

  const form = await request.formData();
  const submissionParse = parseWithZod(form, { schema });

  invariant(submissionParse.status === "success", "Missing selections");

  await updateSubmission({
    id: submission.id,
    selections: submissionParse.value.selections,
    tieBreaker: submissionParse.value.tieBreaker,
  });

  return redirect(
    `/sheets/${params.sheetId}/submissions/${params.submissionId}?updated=1`
  );
};

export default function EditSubmission() {
  const { sheet, submission, optionCounts } = useLoaderData<typeof loader>();
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    return Object.fromEntries(
      submission.selections.map((selection) => [
        selection.option.proposition.id,
        selection.optionId,
      ])
    );
  });
  const [tiebreakerTouched, setTiebreakerTouched] = useState(true);
  const navigation = useNavigation();
  const propositionCount = sheet.propositions.length;
  const selectionCount = Object.keys(selections).length;
  const isSubmitting = navigation.state === "submitting";
  const allPropositionsSelected = propositionCount === selectionCount;
  const disabled = !allPropositionsSelected || !tiebreakerTouched || isSubmitting;
  const propositionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tiebreakerRef = useRef<HTMLDivElement | null>(null);

  const scrollToProposition = (index: number) => {
    const element = propositionRefs.current[index];
    if (element) {
      const yOffset = -120;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToTiebreaker = () => {
    const element = tiebreakerRef.current;
    if (element) {
      const yOffset = -120;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-base-200">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-3xl font-black mb-1">Edit Your Picks</h1>
            <p className="opacity-70">
              Changes are allowed until submissions close.
            </p>
          </div>
          <Link
            className="btn btn-outline"
            to={`/sheets/${sheet.id}/submissions/${submission.id}`}
          >
            Back to Submission
          </Link>
        </div>

        <div className="alert alert-info shadow-lg mb-6">
          <span className="text-sm">
            Save anytime before the deadline — your latest save replaces the
            previous picks.
          </span>
        </div>
      </div>

      <Form
        method="post"
        className="relative pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
      >
        <ProgressBar
          propositions={sheet.propositions}
          selections={selections}
          onPropositionClick={scrollToProposition}
        />

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {sheet?.propositions.map((proposition, index) => (
            <PropositionCard
              key={proposition.id}
              ref={(el) => (propositionRefs.current[index] = el)}
              propositionIndex={index}
              proposition={proposition}
              optionCounts={optionCounts}
              selectedOptionId={selections[proposition.id]}
              onSelection={(propositionId: string, optionId: string) => {
                setSelections((prev) => {
                  const updated = {
                    ...prev,
                    [propositionId]: optionId,
                  };

                  if (Object.keys(updated).length === propositionCount) {
                    scrollToTiebreaker();
                  } else {
                    scrollToProposition(index + 1);
                  }

                  return updated;
                });
              }}
            />
          ))}
          <TiebreakerCard
            ref={tiebreakerRef}
            tieBreakerQuestion={sheet.tieBreakerQuestion}
            onTouch={() => setTiebreakerTouched(true)}
            initialValue={submission.tieBreaker}
          />
        </div>

        <footer className="fixed inset-x-0 bottom-0 z-30 bg-base-100 pt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl">
          <div className="max-w-4xl mx-auto px-4">
            <button
              className={`btn btn-lg w-full shadow-xl text-lg font-bold ${
                disabled ? "btn-disabled" : "btn-primary"
              }`}
              type="submit"
              disabled={disabled}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving Changes...
                </>
              ) : !allPropositionsSelected ? (
                `Pick ${propositionCount - selectionCount} More to Continue`
              ) : (
                "Save Updated Picks"
              )}
            </button>
          </div>
        </footer>
      </Form>
    </div>
  );
}
