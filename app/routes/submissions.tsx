import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { readSailorWithSubmissions } from "~/models/sailor.server";

import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authSailor = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  const sailor = await readSailorWithSubmissions(authSailor.id);
  return json({ sailor });
};

export default () => {
  const { sailor } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Submissions</h1>
      {sailor?.submissions.map((submission) => {
        <div>{submission.createdAt}</div>;
      })}
    </>
  );
};
