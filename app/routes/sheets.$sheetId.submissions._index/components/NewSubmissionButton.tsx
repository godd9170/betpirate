import { Sheet } from "@prisma/client";
import { Link } from "@remix-run/react";
import { IoAddCircle, IoLockClosed } from "react-icons/io5";

export default function NewSubmissionButton({ sheet }: { sheet: Sheet }) {
  if (sheet.status === "CLOSED") {
    return (
      <div className="alert shadow-lg mb-6">
        <IoLockClosed size={24} className="text-base-content" />
        <div>
          <h3 className="font-bold">Submissions Closed</h3>
          <div className="text-sm opacity-70">
            This sheet is no longer accepting new submissions.
          </div>
        </div>
      </div>
    );
  }

  if (sheet.status !== "OPEN") return null;

  return (
    <Link
      className="btn btn-primary btn-lg w-full shadow-xl hover:scale-[1.02] transition-all mb-6 font-bold text-lg"
      to={`/sheets/${sheet.id}/submissions/new`}
    >
      <IoAddCircle size={28} />
      Submit New Picks
    </Link>
  );
}
