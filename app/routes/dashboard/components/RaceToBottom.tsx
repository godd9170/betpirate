import { IoSkullOutline, IoWarning } from "react-icons/io5";

function AvatarImage({ profilePictureUrl, username }: { profilePictureUrl: string | null; username: string }) {
  if (profilePictureUrl) {
    return (
      <img
        src={profilePictureUrl}
        alt={username}
        className="w-8 h-8 rounded-full object-cover border-2 border-error shadow-md"
      />
    );
  }

  const initial = username.charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-error text-error-content flex items-center justify-center font-bold text-sm border-2 border-error shadow-md">
      {initial}
    </div>
  );
}

export default function RaceToBottom({ leaders }: { leaders: any[] }) {
  if (leaders.length === 0) return null;

  // Find the worst ranking
  const worstRanking = Math.max(...leaders.map(l => l.ranking));

  // Get all sailors with the worst ranking
  const lastPlaceSailors = leaders.filter(l => l.ranking === worstRanking);

  // Only show if there are at least 2 participants
  if (leaders.length < 2) return null;

  return (
    <div className="card bg-error/10 border-2 border-error/30 shadow-xl">
      <div className="card-body py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <IoSkullOutline className="text-error" size={28} />
              <h3 className="text-lg font-bold text-error">Race to the Bottom</h3>
            </div>
            <div className="badge badge-error badge-lg gap-1">
              <IoWarning size={14} />
              Last Place
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastPlaceSailors.map((sailor, index) => (
              <div key={index} className="flex items-center gap-2 bg-base-100/80 rounded-lg px-3 py-2 shadow-md">
                <AvatarImage
                  profilePictureUrl={sailor.profilePictureUrl}
                  username={sailor.username}
                />
                <div>
                  <div className="font-semibold text-sm">{sailor.username}</div>
                  <div className="text-xs text-base-content/70">
                    {sailor.correct} correct
                  </div>
                </div>
              </div>
            ))}
            {lastPlaceSailors.length > 1 && (
              <div className="badge badge-warning">
                {lastPlaceSailors.length}-way tie
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
