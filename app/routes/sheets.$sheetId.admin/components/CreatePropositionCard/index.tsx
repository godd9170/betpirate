import { useFetcher } from "@remix-run/react";

export default function CreatePropositionCard({
  sheetId,
}: {
  sheetId: string;
}) {
  const fetcher = useFetcher();
  return (
    <fetcher.Form method="post" action={`/sheets/${sheetId}/propositions`}>
      <div className="card card-sm w-full bg-base-100 shadow-xl">
        <div className="card-body">
          <input
            type="text"
            name="title"
            className="input input-ghost input-lg pl-3"
            placeholder="Title"
          />
          <input
            type="text"
            name="shortTitle"
            className="input input-ghost input-sm pl-3"
            placeholder="Short Title"
          />
          <input
            type="text"
            name="subtitle"
            className="input input-ghost input-sm"
            placeholder="Sub Title"
          />
          <div className="card-actions justify-end">
            <div className="flex w-full">
              <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">
                <input
                  type="text"
                  name="options[0].title"
                  className="input input-ghost input-sm w-full"
                  placeholder="Title"
                />
                <input
                  type="text"
                  name="options[0].shortTitle"
                  className="input input-ghost input-xs w-full"
                  placeholder="Short Title"
                />
              </div>
              <div className="divider divider-horizontal">OR</div>
              <div className="grid h-20 flex-grow card bg-base-300 rounded-box place-items-center">
                <input
                  type="text"
                  name="options[1].title"
                  className="input input-ghost input-sm w-full"
                  placeholder="Title"
                />
                <input
                  type="text"
                  name="options[1].shortTitle"
                  className="input input-ghost input-xs w-full"
                  placeholder="Short Title"
                />
              </div>
            </div>
          </div>
          <button className="btn btn-primary" type="submit">
            Create
          </button>
        </div>
      </div>
    </fetcher.Form>
  );
}
