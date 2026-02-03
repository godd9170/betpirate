import EditPropositionCard from "./EditPropositionCard";
import CreatePropositionCard from "./CreatePropositionCard";
import { SheetWithPropositions } from "~/models/sheet.server";

export default function EditSheet({ sheet }: { sheet: SheetWithPropositions }) {
  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Sheet Builder</h2>
              <p className="text-sm text-base-content/70">
                Add questions, upload imagery, and fine-tune the order.
              </p>
            </div>
            <div className="stats shadow">
              <div className="stat place-items-center">
                <div className="stat-title text-xs">Questions</div>
                <div className="stat-value text-2xl text-primary">
                  {sheet.propositions.length}
                </div>
                <div className="stat-desc text-xs">Total props</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sheet.propositions.map((proposition, index) => (
          <EditPropositionCard
            key={proposition.id}
            sheetId={sheet.id}
            proposition={proposition}
            index={index}
            totalCount={sheet.propositions.length}
          />
        ))}
      </div>

      <CreatePropositionCard sheetId={sheet.id} />
    </div>
  );
}
