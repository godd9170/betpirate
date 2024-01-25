import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSheetWithSubmissions } from "~/models/sheet.server";
import Button from "~/components/Button";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.sheetId, `params.sheetId is required`);
  const sheet = await readSheetWithSubmissions(params.sheetId);
  return json({ sheet });
};

export default () => {
  const { sheet } = useLoaderData<typeof loader>();
  const transactions = [
    {
      id: "AAPS0L",
      company: "Chase & Co.",
      share: "CAC",
      commission: "+$4.37",
      price: "$3,509.00",
      quantity: "12.00",
      netAmount: "$4,397.00",
    },
    // More transactions...
  ];
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            {sheet?.title}
          </h1>
          <p className="mt-2 text-sm text-gray-700">All submissions</p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Name
                  </th>
                  {sheet?.propositions.map((proposition, i) => (
                    <th
                      scope="col"
                      className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      id={`${proposition.title}`}
                    >
                      {`Q${i + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sheet?.submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                      {submission.sailor.username}
                    </td>
                    {submission.selections.map((selection) => (
                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                        {selection.option.title}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
