import EditPropositionCard from "./EditPropositionCard";
import CreatePropositionCard from "./CreatePropositionCard";
import { SheetWithPropositions } from "~/models/sheet.server";

export default function EditSheet({ sheet }: { sheet: SheetWithPropositions }) {
  return (
    <>
      {sheet.propositions.map((proposition) => (
        <EditPropositionCard sheetId={sheet.id} proposition={proposition} />
      ))}
      <hr />
      <CreatePropositionCard sheetId={sheet.id} />
    </>
  );
}
