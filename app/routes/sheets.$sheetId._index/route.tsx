import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // this component's only job is to ensure a user landing on /sheet/id gets
  // forwarded to the submissions.
  return redirect(`/sheets/${params.sheetId}/submissions`);
};
