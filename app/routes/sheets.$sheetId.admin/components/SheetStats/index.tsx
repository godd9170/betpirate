export default function SheetStats({ submissions }) {
  return (
    <>
      <p>Total Submissions: {submissions.length}</p>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>username</th>
              <th>name</th>
              <th>paid</th>
              <th>submitted at</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <th>{submission?.sailor?.username}</th>
                <th>{`${submission?.sailor?.firstName} ${submission?.sailor?.lastName}`}</th>
                <th>{submission.isPaid ? "✅" : "❌"}</th>
                <th>{submission.createdAt}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
