import { Sheet } from "@prisma/client";
import { Link } from "@remix-run/react";

export default function LeaderBoard({
  sheet,
  leaders,
}: {
  sheet: any;
  leaders: any[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>Sailor</th>
            <th>Correct Picks</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader) => (
            <tr key={leader.submissionId}>
              <th>{leader.ranking}</th>
              <td>
                <Link
                  to={`/sheets/${sheet.id}/submissions/${leader.submissionId}`}
                >
                  {leader.username}
                </Link>
              </td>
              <td>{leader.correct}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
