import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import Button from "~/components/Button";
import { readSubmission } from "~/models/submission.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.submissionId, `params.submissionId is required`);
  const submission = await readSubmission(params.submissionId);
  return json({ submission });
};

export default () => {
  const { submission } = useLoaderData<typeof loader>();
  return (
    <>
      <div>
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          {`${submission?.sheet.title} - Submission`}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {`Submitted on ${submission?.createdAt}`}
        </p>
      </div>
      {submission?.selections.map((selection) => (
        <div className="mt-5 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-5 sm:gap-4 sm:py-5">
              <dt className="text-sm font-medium text-gray-500 sm:col-span-4">
                {selection.option.proposition.title}
              </dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-1 sm:mt-0">
                <span className="flex-grow">{selection.option.title}</span>
              </dd>
            </div>
          </dl>
        </div>
      ))}
      <Link to={`/sheets/${submission?.sheet.id}/submissions`}>
        <Button>See all submissions</Button>
      </Link>
    </>
  );
};
