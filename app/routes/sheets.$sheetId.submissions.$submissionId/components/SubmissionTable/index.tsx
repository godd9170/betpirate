import {
  SelectionWithPropositionOption,
  SubmissionWithPropositionSelections,
} from "~/models/submission.server";
function Mark({ selection }: { selection: SelectionWithPropositionOption }) {
  let color = "text-base";
  let status = "Pending";

  if (selection.option.proposition.answerId) {
    if (selection.option.proposition.answerId === selection.optionId) {
      color = "text-success";
      status = "Correct";
    } else {
      color = "text-error";
      status = "Incorrect";
    }
  }

  return (
    <span className={color}>
      {selection.option.shortTitle} ({status})
    </span>
  );
}

export default function SubmissionTable({
  submission,
}: {
  submission: SubmissionWithPropositionSelections;
}) {
  return (
    <div>
      {submission.selections.map((selection) => (
        <div
          key={selection.id}
          className="card w-full bg-base-100 shadow-md mb-4 overflow-x-auto"
        >
          <div className="card-body">
            <h2 className="card-title">{selection.option.proposition.title}</h2>
            <p>
              <Mark selection={selection} />
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
