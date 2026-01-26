import { Sailor } from "@prisma/client";

export default function SheetInstructions({
  sailor,
  count,
  start,
}: {
  sailor: Sailor;
  count: number;
  start: () => void;
}) {
  return (
    <div className="card card-sm m-4 border-lg bg-base-200">
      <div className="card-body">
        <div className="card-title">Ahoy {sailor.username}!</div>
        <p>
          To be submitin’ yer Super Bowl prop sheet, mark yer answer fer each of
          the {count} props. Once ye’ve reviewed yer choices an’ be certain in
          yer decisions, click the submit button to send it off to the high
          seas!
        </p>
        <p>
          Remember, most correct answers takes home{" "}
          <span className="font-semibold">90%</span> of the prize pool, least
          correct gets <span className="font-semibold">10%</span>.
        </p>
      </div>
      <button className="btn btn-accent" onClick={start}>
        Got it!
      </button>
    </div>
  );
}
