import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { readSailor } from "~/models/sailor.server";
import { readSheet } from "~/models/sheet.server";
import { authenticator } from "~/services/auth.server";
import { IoMdSettings } from "react-icons/io";
import { IoIosPodium, IoMdListBox } from "react-icons/io";
import Logo from "~/components/Logo";

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
            <Logo size={"40px"} />
          </Link>
        </div>
        <Link to={`/sheets/${sheet.id}`}>
          <h1 className="text-2xl font-black text-center">{sheet.title}</h1>
        </Link>
        <div className="w-12">
          {!!sailor?.admin && (
            <Link to={`/sheets/${sheet.id}/admin`}>
              <IoMdSettings size={24} />
            </Link>
          )}
        </div>
      </header>
      <main className="pb-16 min-h-[calc(100vh-4rem)] container mx-auto">
        <Outlet />
      </main>
      {!location.pathname.includes("new") && (
        <nav className="btm-nav">
          <Link
            to={SUBMISSIONS_LINK}
            className={location.pathname === SUBMISSIONS_LINK ? "active" : ""}
          >
            <IoMdListBox size={24} />
            <span className="btm-nav-label">Submissions</span>
          </Link>
          <Link
            to={LEADERBOARD_LINK}
            className={location.pathname === LEADERBOARD_LINK ? "active" : ""}
          >
            <IoIosPodium size={24} />
            <span className="btm-nav-label">Leaderboard</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
