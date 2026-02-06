export default function SubmissionHeader({
  username,
  profilePictureUrl,
  isOwner,
  canEdit,
}: {
  username: string | null;
  profilePictureUrl: string | null;
  isOwner: boolean;
  canEdit: boolean;
}) {
  const title = username ? `${username}'s Picks` : "Your Picks";

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        {!isOwner && (
          <img
            src={profilePictureUrl ?? "/fallback-avatar.svg"}
            alt={username ?? "Sailor"}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-primary bg-accent shadow-lg"
          />
        )}
        <h1 className="text-3xl font-black">{title}</h1>
      </div>
      {isOwner && (
        <div className="alert shadow-lg mb-4">
          <span className="text-sm">
            {canEdit
              ? "Choose any option to update your pick, then tap Save at the bottom."
              : "Submissions are closed - picks are now locked."}
          </span>
        </div>
      )}
    </>
  );
}
