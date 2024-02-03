import { SheetWithPropositions } from "~/models/sheet.server";
import MarkProposition from "./MarkProposition";

export default function MarkSheet({ sheet }: { sheet: SheetWithPropositions }) {
  return (
    <div className="overflow-x-auto">
      <h1 className="text-xl text-center py-6 font-black">Sheet Answer Key</h1>
      {sheet.propositions.map((proposition) => (
        <MarkProposition key={proposition.id} proposition={proposition} />
      ))}
    </div>
  );
}
