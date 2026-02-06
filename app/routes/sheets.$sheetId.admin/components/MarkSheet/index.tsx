import { SheetWithPropositions } from "~/models/sheet.server";
import MarkProposition from "./MarkProposition";

export default function MarkSheet({ sheet }: { sheet: SheetWithPropositions }) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black">Answer Key</h2>
            <p className="text-sm text-base-content/70">
              Set the correct answer for each proposition.
            </p>
          </div>
          <div className="stats bg-base-200 shadow">
            <div className="stat py-3 px-4">
              <div className="stat-title text-xs">Answered</div>
              <div className="stat-value text-2xl">
                {sheet.propositions.filter((p) => p.answerId).length}
                <span className="text-base-content/50 text-base font-normal">
                  /{sheet.propositions.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sheet.propositions.map((proposition) => (
            <MarkProposition key={proposition.id} proposition={proposition} />
          ))}
        </div>
      </div>
    </div>
  );
}
