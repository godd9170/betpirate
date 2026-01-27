export default function SheetInstructions({
  sailor,
  count,
  hasStarted,
  start,
}: {
  sailor: {
    username: string | null;
  };
  count: number;
  hasStarted: boolean;
  start: () => void;
}) {
  if (hasStarted) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
      <div className="card bg-primary text-primary-content shadow-2xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🏴‍☠️</span>
            <h2 className="card-title text-3xl font-black">
              Ahoy, {sailor.username}!
            </h2>
          </div>

          <div className="space-y-4 text-lg">
            <p className="leading-relaxed">
              Welcome aboard, matey! You're about to make <span className="font-black text-2xl">{count}</span> picks
              that could fill yer treasure chest. Choose wisely for each proposition below!
            </p>

            <div className="alert shadow-lg">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💰</span>
                <div>
                  <p className="font-bold mb-1">The Bounty:</p>
                  <p>
                    Most correct answers claims <span className="font-black text-warning text-xl">90%</span> of the booty
                  </p>
                  <p>
                    Least correct walks away with <span className="font-black text-info text-xl">10%</span> (consolation prize!)
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm opacity-90">
              Once you've made all yer picks, review 'em carefully, then click submit to send it off to the high seas!
            </p>
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-accent btn-lg font-bold shadow-lg"
              onClick={start}
            >
              🎯 Let's Make Some Picks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
