import { Sailor } from "@prisma/client";

export default function SheetInstructions({
  sailor,
  count,
}: {
  sailor: Sailor;
  count: number;
}) {
  return (
    <div className="card card-compact m-4 border-lg bg-base-200">
      <div className="card-body">
        <div className="card-title">Ahoy {sailor.username}!</div>
        <p>
          To be submitin’ yer Super Bowl prop sheet, mark yer answer fer each of
          the {count} props. Once ye’ve reviewed yer choices an’ be certain in
          yer decisions, click the submit button to send it off to the high
          seas!
        </p>
      </div>
    </div>
  );
}
