import { Sheet } from "@prisma/client";
import { Link } from "@remix-run/react";
import { IoAddCircle } from "react-icons/io5";

export default function NewSubmissionButton({ sheet }: { sheet: Sheet }) {
  if (sheet.status !== "OPEN") return null;
  return (
    <Link className="btn btn-accent" to={`/sheets/${sheet.id}/submissions/new`}>
      <IoAddCircle size={24} /> New Submission
    </Link>
  );
}
