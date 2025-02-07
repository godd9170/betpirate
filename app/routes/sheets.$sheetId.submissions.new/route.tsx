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
import { parse } from "@conform-to/zod";
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

  const submissionParse = parse(form, { schema });

  invariant(!!submissionParse.value?.selections, "Missing selections");

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
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <SheetInstructions
        sailor={sailor}
        count={propositionCount}
        start={() => scrollToProposition(0)}
      />

      <Form method="post">
        <progress
          className="progress sticky top-0 z-10"
          value={selectionCount}
          max={propositionCount}
        ></progress>
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
        <footer className="sticky bottom-0">
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
