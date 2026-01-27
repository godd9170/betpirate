import { Proposition, PropositionOption } from "@prisma/client";
import { useFetcher } from "@remix-run/react";

export default function EditPropositionCard({
  sheetId,
  proposition,
}: {
  sheetId: string;
  proposition: Proposition & { options: PropositionOption[] };
}) {
  const fetcher = useFetcher();
  const action = `/sheets/${sheetId}/propositions/${proposition.id}`;
  return (
    <fetcher.Form method="post" action={action}>
      <div className="card card-sm w-full bg-base-100 shadow-xl">
        <div className="card-body">
          <input
            type="text"
            name="title"
            className="input input-ghost input-lg pl-3"
            defaultValue={proposition.title}
            placeholder="Title"
          />
          <input
            type="text"
            name="shortTitle"
            className="input input-ghost input-sm pl-3"
            defaultValue={proposition.shortTitle || undefined}
            placeholder="Short Title"
          />
          <input
            type="text"
            name="subtitle"
            className="input input-ghost input-sm"
            defaultValue={proposition.subtitle || undefined}
            placeholder="Subtitle"
          />
          <div className="card-actions justify-end">
            <div className="flex w-full">
              <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">
                <input
                  type="text"
                  hidden
                  name="options[0].id"
                  value={proposition.options[0]?.id}
                />
                <input
                  type="text"
                  name="options[0].title"
                  className="input input-ghost input-sm w-full"
                  defaultValue={proposition.options[0]?.title || undefined}
                  placeholder="Title"
                />
                <input
                  type="text"
                  name="options[0].shortTitle"
                  className="input input-ghost input-xs w-full"
                  defaultValue={proposition.options[0]?.shortTitle || undefined}
                  placeholder="Short Title"
                />
              </div>
              <div className="divider divider-horizontal">OR</div>
              <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">
                <input
                  type="text"
                  hidden
                  name="options[1].id"
                  value={proposition.options[1]?.id}
                />
                <input
                  type="text"
                  name="options[1].title"
                  className="input input-ghost input-sm w-full"
                  defaultValue={proposition.options[1]?.title || undefined}
                  placeholder="Title"
                />
                <input
                  type="text"
                  name="options[1].shortTitle"
                  className="input input-ghost input-xs w-full"
                  defaultValue={proposition.options[1]?.shortTitle || undefined}
                  placeholder="Short Title"
                />
              </div>
            </div>
          </div>
          <button className="btn btn-secondary" type="submit">
            Update
          </button>
        </div>
      </div>
    </fetcher.Form>
  );
}
