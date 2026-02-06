import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSailor } from "~/models/sailor.server";
import { readSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import { IoMdSettings } from "react-icons/io";
import { IoIosPodium, IoMdListBox } from "react-icons/io";
import Logo from "~/components/Logo";
import ThemeToggle from "~/components/ThemeToggle";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const sailorId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  invariant(sailorId, `sailorId is required`);
  const sailor = await readSailor(sailorId);

  const sheetId = params.sheetId;
  invariant(sheetId, `sheetId is required`);

  const sheet = await readSheet(sheetId);
  invariant(!!sheet, "No sheet exists with this id");

  return json({ sheet, sailor });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.sheet?.title ?? "Bet Pirate" }];
};

export default function Sheet() {
  const location = useLocation();
  const { sheet, sailor } = useLoaderData<typeof loader>();
  const SUBMISSIONS_LINK = `/sheets/${sheet.id}/submissions`;
  const LEADERBOARD_LINK = `/sheets/${sheet.id}/leaders`;
  return (
    <div className="flex flex-col">
      <header className="w-full flex items-center justify-between p-4">
        <div className="w-12">
          <Link to={`/sheets/${sheet.id}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden ring ring-primary ring-offset-base-100 ring-offset-1">
              <img
                src={sailor?.profilePictureUrl || "/fallback-avatar.svg"}
                alt={sailor?.username || "User"}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>
        <Link to={`/sheets/${sheet.id}`} className="flex items-center">
          <Logo size={"48px"} />
          <h1 className="text-xl font-black uppercase pr-2">Betpirate</h1>
        </Link>
        <div className="w-12">
          <ThemeToggle />
        </div>
      </header>
      <main className="pb-16 min-h-[calc(100vh-4rem)] container mx-auto">
        <Outlet />
      </main>
      {!location.pathname.includes("new") && (
        <nav className="dock">
          <Link
            to={SUBMISSIONS_LINK}
            className={location.pathname === SUBMISSIONS_LINK ? "active" : ""}
          >
            <IoMdListBox size={24} />
            <span className="dock-label">Submissions</span>
          </Link>
          <Link
            to={LEADERBOARD_LINK}
            className={location.pathname === LEADERBOARD_LINK ? "active" : ""}
          >
            <IoIosPodium size={24} />
            <span className="dock-label">Leaderboard</span>
          </Link>
          {!!sailor?.admin && (
            <Link to={`/sheets/${sheet.id}/admin`}>
              <IoMdSettings size={24} />
              <span className="dock-label">Admin</span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
