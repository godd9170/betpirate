import { Sheet } from "@prisma/client";
import { Link } from "@remix-run/react";
import { SheetLeader } from "~/models/sheet.server";

export default function LeaderBoard({
  sheet,
  leaders,
}: {
  sheet: Sheet;
  leaders: SheetLeader[];
}) {
  return (
    <div className="overflow-x-auto">
      {leaders
        .reduce((acc, leader) => {
          const rankingGroup = acc.find(
            (group) => group.ranking === leader.ranking
          );
          if (rankingGroup) {
            rankingGroup.leaders.push(leader);
          } else {
            acc.push({
              ranking: leader.ranking,
              correct: leader.correct,
              leaders: [leader],
            });
          }
          return acc;
        }, [] as { ranking: number; correct: number; leaders: SheetLeader[] }[])
        .map((group) => (
          <div key={group.ranking} className="card">
            <div className="card-header">
              <h2 className="card-title">Ranking: {group.ranking}</h2>
            </div>
            <div className="card-body">
              {group.leaders.map((leader) => (
                <div key={leader.submissionId} className="card card-compact">
                  <div className="card-body">
                    <h5 className="card-title">{leader.username}</h5>
                    <p className="card-text">
                      Correct Picks:{" "}
                      <Link
                        className="underline"
                        to={`/sheets/${sheet.id}/submissions/${leader.submissionId}`}
                      >
                        {leader.correct}
                      </Link>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
