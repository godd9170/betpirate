import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { ShouldRevalidateFunction, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  deleteSubmission,
  readSheetSubmissionRanking,
  readSubmission,
  updateSubmissionSelection,
  updateSubmissionNickname,
  updateSubmissionTieBreaker,
} from "~/models/submission.server";
import { authenticator } from "~/services/auth.server";
import { readSheet, readSheetSummary } from "~/models/sheet.server";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import SelectionsGrid from "./components/SelectionsGrid";
import SubmissionHeader from "./components/SubmissionHeader";
import TieBreakerCard from "./components/TieBreakerCard";
import TotalsCard from "./components/TotalsCard";

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  formData,
  defaultShouldRevalidate,
}) => {
  if (formMethod?.toLowerCase() === "post") {
    const intent = formData?.get("intent");
    if (intent === "option" || intent === "tieBreaker" || intent === "nickname") {
      return false;
    }
  }

  return defaultShouldRevalidate;
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(!!sailorId, `sailorId is required`);

  const sheetId = params.sheetId;
  invariant(!!sheetId, `params.sheetId is required`);

  const submissionId = params.submissionId;
  invariant(!!submissionId, `params.submissionId is required`);

  const submission = await readSubmission(submissionId);
  invariant(!!submission, "submission not found");
  const sheet = await readSheet(sheetId);
  invariant(!!sheet, "sheet not found");

  const sheetSummary = await readSheetSummary(sheetId);
  const submissionRank = await readSheetSubmissionRanking(
    sheetId,
    submissionId
  );

  return json({ sailorId, submission, submissionRank, sheetSummary, sheet });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const { sheetId, submissionId } = params;
  invariant(!!sheetId, "missing sheet id");
  invariant(!!submissionId, "missing submission id");

  if (request.method === "DELETE") {
    await deleteSubmission(submissionId);
    return "success";
  }

  if (request.method === "POST") {
    const sailorId = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
    });
    invariant(!!sailorId, "sailorId is required");

    const submission = await readSubmission(submissionId);
    if (!submission || submission.sheetId !== sheetId) {
      throw new Response("Not found", { status: 404 });
    }
    if (submission.sailorId !== sailorId) {
      throw new Response("Forbidden", { status: 403 });
    }
    if (submission.sheet.status === "CLOSED") {
      throw new Response("Submissions closed", { status: 403 });
    }

    const form = await request.formData();
    const intent = form.get("intent");

    if (intent === "tieBreaker") {
      const parsed = parseWithZod(form, {
        schema: z.object({ tieBreaker: z.coerce.number() }),
      });
      invariant(parsed.status === "success", "Missing tie breaker");

      await updateSubmissionTieBreaker(
        submissionId,
        parsed.value.tieBreaker
      );
      return json({ ok: true });
    }

    if (intent === "nickname") {
      const parsed = parseWithZod(form, {
        schema: z.object({ nickname: z.string().max(60).optional() }),
      });
      invariant(parsed.status === "success", "Missing nickname");

      const rawNickname = (parsed.value.nickname ?? "").trim();
      const nickname = rawNickname.length > 0 ? rawNickname : null;

      await updateSubmissionNickname(submissionId, nickname);
      return json({ ok: true });
    }

    if (intent === "option") {
      const parsed = parseWithZod(form, {
        schema: z.object({ optionId: z.string() }),
      });
      invariant(parsed.status === "success", "Missing option");

      await updateSubmissionSelection(
        submissionId,
        parsed.value.optionId,
        sheetId
      );
      return json({ ok: true });
    }

    throw new Response("Bad request", { status: 400 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export default function Submission() {
  const { sailorId, submission, submissionRank, sheetSummary, sheet } =
    useLoaderData<typeof loader>();
  const isOwner = submission?.sailorId === sailorId;
  const canEdit = isOwner && sheet.status === "OPEN";
  const submissionLabel = new Date(submission.createdAt).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <SubmissionHeader
          username={submission?.sailor.username ?? null}
          isOwner={isOwner}
          canEdit={canEdit}
        />
        <TotalsCard
          show={sheet.status !== "OPEN"}
          sheetSummary={sheetSummary}
          submissionRank={submissionRank}
        />
        <TieBreakerCard
          submissionLabel={`Submitted ${submissionLabel}`}
          nickname={submission.nickname}
          initialValue={submission.tieBreaker}
          canEdit={canEdit}
        />
        <SelectionsGrid
          sheet={sheet}
          selections={submission.selections}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
