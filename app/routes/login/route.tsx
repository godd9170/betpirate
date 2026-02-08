import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import PhoneNumberForm from "./components/PhoneNumberForm";
import { commitSession, sessionStorage } from "~/services/session.server";
import { readLatestSheet } from "~/models/sheet.server";
import { db } from "~/utils/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticator.authenticate("phone-number", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const latestSheet = await readLatestSheet();

  let submissionCount = 0;
  if (latestSheet) {
    const sheetWithCount = await db.sheet.findUnique({
      where: { id: latestSheet.id },
      select: { _count: { select: { submissions: true } } },
    });
    submissionCount = sheetWithCount?._count?.submissions || 0;
  }

  return json(
    {
      error: session.get(authenticator.sessionErrorKey),
      phone: session.get("auth:phone"),
      sheetTitle: latestSheet?.title ?? null,
      sheetSubtitle: latestSheet?.subtitle ?? null,
      closesAt: latestSheet?.closesAt ?? null,
      entryCount: submissionCount,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session), // You must commit the session whenever you read a flash
      },
    },
  );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.sheetTitle ?? "Bet Pirate" }];
};

export default () => {
  let { error, sheetTitle, sheetSubtitle, entryCount, closesAt } =
    useLoaderData<typeof loader>();
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-base-200">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-contain bg-repeat"
        style={{ backgroundImage: "url(/login-bg.png)" }}
      />
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/25" />
      {/* Content */}
      <div className="relative z-10">
        <PhoneNumberForm
          error={error}
          sheetTitle={sheetTitle}
          sheetSubtitle={sheetSubtitle}
          entryCount={entryCount}
          closesAt={closesAt}
        />
      </div>
    </div>
  );
};
