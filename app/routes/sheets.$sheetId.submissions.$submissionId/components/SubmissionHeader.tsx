export default function SubmissionHeader({
  username,
  isOwner,
  canEdit,
}: {
  username: string | null;
  isOwner: boolean;
  canEdit: boolean;
}) {
  const title = username ? `${username}'s Picks` : "Your Picks";

  return (
    <>
      <h1 className="text-3xl font-black mb-3">{title}</h1>
      {isOwner && (
        <div className="alert shadow-lg mb-4">
          <span className="text-sm">
            {canEdit
              ? "Choose any option to update your pick."
              : "Submissions are closed - picks are now locked."}
          </span>
        </div>
      )}
    </>
  );
}
