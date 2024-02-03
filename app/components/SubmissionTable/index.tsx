import {
  SelectionWithPropositionOption,
  SubmissionWithPropositionSelections,
} from "~/models/submission.server";

function Mark({ selection }: { selection: SelectionWithPropositionOption }) {
  if (!selection.option.proposition.answerId) return null;
  if (selection.option.proposition.answerId === selection.optionId) return "✅";
  return "❌";
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
              <td>{selection.option.proposition.shortTitle}</td>
              <td>
                {selection.option.shortTitle}
                <Mark selection={selection} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
