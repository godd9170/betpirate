import {
  json,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheet } from "~/models/sheet.server";
import { createSubmission } from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";
import PropositionCard from "./components/PropositionCard";
import { useRef, useState } from "react";
import TiebreakerCard from "./components/TiebreakerCard";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import SheetInstructions from "./components/SheetInstructions";
import { readSailor } from "~/models/sailor.server";

export const schema = z.object({
  selections: z.array(z.object({ optionId: z.string() })),
  tieBreaker: z.number(),
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(!!sailorId, `sailorId is required`);

  const sailor = await readSailor(sailorId);

  if (sailor === null) {
    await authenticator.logout(request, { redirectTo: "/login" });
    return;
  }

  const sheetId = params.sheetId;
  invariant(sheetId, `params.sheetId is required`);

  const sheet = await readSheet(sheetId);
  invariant(!!sheet, `no sheet found`);

  if (sheet.status === "CLOSED") return redirect(`/sheets/${sheetId}`);

  return json({ sheet, sailor });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request);
  invariant(sailorId != null, `login to submit yer sheet`);
  invariant(params.sheetId, `params.sheetId is required`);
  const form = await request.formData();

  const submissionParse = parseWithZod(form, { schema });

  invariant(submissionParse.status === 'success', "Missing selections");

  const submission = await createSubmission({
    sheetId: params.sheetId,
    sailorId,
    selections: submissionParse.value.selections,
    tieBreaker: submissionParse.value.tieBreaker,
  });

  return redirect(`/sheets/${params.sheetId}/submissions`);
};

export default function Sheet() {
  const { sheet, sailor } = useLoaderData<typeof loader>();
  const [selections, setSelections] = useState<object>({});
  const [hasStarted, setHasStarted] = useState(false);
  const navigation = useNavigation();
  const propositionCount = sheet.propositions.length;
  const selectionCount = Object.keys(selections).length;
  const isSubmitting =
    navigation.formAction === `/sheets/${sheet.id}/submissions?index`;
  const disabled = propositionCount != selectionCount || isSubmitting;
  const propositionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToProposition = (index: number) => {
    const element = propositionRefs.current[index];
    if (element) {
      // Account for sticky header height (approx 80px)
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    // Small delay to allow the instructions card to dismiss before scrolling
    setTimeout(() => scrollToProposition(0), 100);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <SheetInstructions
        sailor={sailor}
        count={propositionCount}
        hasStarted={hasStarted}
        start={handleStart}
      />

      <Form method="post" className="relative">
        {/* Progress bar */}
        <div className="sticky top-0 z-30 bg-base-100 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Your Progress</span>
              <span className="text-sm font-bold text-primary">
                {selectionCount} / {propositionCount}
              </span>
            </div>
            <progress
              className="progress progress-primary w-full h-3"
              value={selectionCount}
              max={propositionCount}
            ></progress>
          </div>
        </div>

        {/* Propositions container */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {sheet?.propositions.map((proposition, index) => (
            <PropositionCard
              key={proposition.id}
              ref={(el) => (propositionRefs.current[index] = el)}
              propositionIndex={index}
              proposition={proposition}
              onSelection={(propositionId: string, optionId: string) => {
                setSelections((prev) => ({
                  ...prev,
                  [propositionId]: optionId,
                }));
                scrollToProposition(index + 1);
              }}
            />
          ))}
          <TiebreakerCard tieBreakerQuestion={sheet.tieBreakerQuestion} />
        </div>

        {/* Sticky footer */}
        <footer className="sticky bottom-0 z-30 bg-base-100 pt-8 pb-6 shadow-2xl">
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
                  Hoisting the Colors...
                </>
              ) : disabled ? (
                `Pick ${propositionCount - selectionCount} More to Continue`
              ) : (
                "⚓ Submit Your Picks & Set Sail!"
              )}
            </button>
          </div>
        </footer>
      </Form>
    </div>
  );
}
