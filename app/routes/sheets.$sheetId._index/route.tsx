import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // this component's only job is to send a user to the right
  // page within the sheet, depending on the status of the sheet.
  return redirect(`/sheets/${params.sheetId}/submissions`);
};
