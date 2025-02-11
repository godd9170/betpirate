import { Sailor, Sheet } from "@prisma/client";
import { Link } from "@remix-run/react";
import { IoChevronForwardCircle } from "react-icons/io5";
import Ordinal from "~/components/Ordinal";
import { SheetLeader } from "~/models/sheet.server";

export default function LeaderBoard({
  sailor,
  sheet,
  leaders,
}: {
  sailor: Sailor;
  sheet: Sheet;
  leaders: SheetLeader[];
}) {
  return (
    <div className="overflow-x-auto mx-2">
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
              <h2 className="card-title flex justify-center sm:justify-start">
                <Ordinal number={group.ranking} />
                <span className="text-sm font-light">
                  ({group.correct} Correct)
                </span>
              </h2>
            </div>
            <div className="card-body">
              {group.leaders.map((leader) => (
                <ul key={leader.submissionId}>
                  <Link
                    to={`/sheets/${sheet.id}/submissions/${leader.submissionId}`}
                  >
                    <li className="flex font-semibold items-center">
                      <span className="pr-2">
                        {leader.username}
                        {sailor.id === leader.sailorId && (
                          <span className="font-bold">{` (you)`}</span>
                        )}
                      </span>
                      <IoChevronForwardCircle />
                    </li>
                  </Link>
                </ul>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
