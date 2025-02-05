import {
  SelectionWithPropositionOption,
  SubmissionWithPropositionSelections,
} from "~/models/submission.server";

function Mark({ selection }: { selection: SelectionWithPropositionOption }) {
  let color = "text-base";
  if (!selection.option.proposition.answerId) color = "text-base";
  else if (selection.option.proposition.answerId === selection.optionId)
    color = "text-success";
  else color = "text-error";

  return <span className={color}>{selection.option.shortTitle}</span>;
}

export default function SubmissionTable({
  submission,
}: {
  submission: SubmissionWithPropositionSelections;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Prop</th>
            <th>Selection</th>
          </tr>
        </thead>
        <tbody>
          {submission.selections.map((selection) => (
            <tr>
              <td>{selection.option.proposition.title}</td>
              <td>
                <Mark selection={selection} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
