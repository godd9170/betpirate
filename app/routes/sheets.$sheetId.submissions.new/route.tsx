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
import ProgressBar from "./components/ProgressBar";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import SheetInstructions from "./components/SheetInstructions";
import { readSailor } from "~/models/sailor.server";
import { sendSubmissionConfirmationSMS } from "~/services/sms.server";

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

  invariant(submissionParse.status === "success", "Missing selections");

  const submission = await createSubmission({
    sheetId: params.sheetId,
    sailorId,
    selections: submissionParse.value.selections,
    tieBreaker: submissionParse.value.tieBreaker,
  });

  // Send confirmation SMS (failure does not block submission)
  const sailor = await readSailor(sailorId);
  if (sailor?.phone) {
    await sendSubmissionConfirmationSMS({
      phone: sailor.phone,
      sheetName: submission.sheet.title,
    });
  }

  return redirect(`/sheets/${params.sheetId}/submissions`);
};

export default function Sheet() {
  const { sheet, sailor } = useLoaderData<typeof loader>();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [tiebreakerTouched, setTiebreakerTouched] = useState(false);
  const navigation = useNavigation();
  const propositionCount = sheet.propositions.length;
  const selectionCount = Object.keys(selections).length;
  const isSubmitting =
    navigation.formAction === `/sheets/${sheet.id}/submissions?index`;
  const allPropositionsSelected = propositionCount === selectionCount;
  const disabled =
    !allPropositionsSelected || !tiebreakerTouched || isSubmitting;
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

  const handleStart = () => {
    setHasStarted(true);
    // Small delay to allow the instructions card to dismiss before scrolling
    setTimeout(() => scrollToProposition(0), 100);
  };

  return (
    <div className="min-h-[100dvh] bg-base-200">
      <SheetInstructions
        sailor={sailor}
        count={propositionCount}
        hasStarted={hasStarted}
        start={handleStart}
      />

      <Form
        method="post"
        className="relative pb-[calc(5rem+env(safe-area-inset-bottom))]"
      >
        <ProgressBar
          propositions={sheet.propositions}
          selections={selections}
          onPropositionClick={scrollToProposition}
        />

        {/* Propositions container */}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {sheet?.propositions.map((proposition, index) => (
            <PropositionCard
              key={proposition.id}
              ref={(el) => (propositionRefs.current[index] = el)}
              propositionIndex={index}
              proposition={proposition}
              selectedOptionId={selections[proposition.id]}
              onSelection={(propositionId: string, optionId: string) => {
                setSelections((prev) => {
                  const updated = {
                    ...prev,
                    [propositionId]: optionId,
                  };

                  // Check if all propositions are now answered
                  const shouldScrollToTiebreaker =
                    Object.keys(updated).length === propositionCount;
                  const nextIndex = index + 1;
                  window.setTimeout(() => {
                    if (shouldScrollToTiebreaker) {
                      scrollToTiebreaker();
                    } else {
                      scrollToProposition(nextIndex);
                    }
                  }, 200);

                  return updated;
                });
              }}
            />
          ))}
          <TiebreakerCard
            ref={tiebreakerRef}
            tieBreakerQuestion={sheet.tieBreakerQuestion}
            onTouch={() => setTiebreakerTouched(true)}
          />
        </div>

        {/* Sticky footer */}
        <footer className="fixed inset-x-0 bottom-0 z-30 bg-base-100 pt-2 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl">
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
              ) : !allPropositionsSelected ? (
                `Pick ${propositionCount - selectionCount} More to Continue`
              ) : !tiebreakerTouched ? (
                "⚔️ Set Your Tie Breaker to Continue"
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
