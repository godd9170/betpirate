import SubmissionRow from "./SubmissionRow";

export default function SheetStats({ submissions }) {
  return (
    <>
      <div className="flex">
        <div className="stat">
          <div className="stat-title">Total Submissions</div>
          <div className="stat-value">{submissions.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Paid</div>
          <div className="stat-value">
            {submissions.filter((s) => s.isPaid).length}/{submissions.length}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>paid</th>
              <th>name</th>
              <th>created</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <SubmissionRow submission={submission} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
