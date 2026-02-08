import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import {
  readLatestSheet,
  readSheet,
  readSheetDashboard,
} from "~/models/sheet.server";
import PropMatrix from "./components/PropMatrix";
import RaceView from "./components/RaceView";
import { IoGrid, IoBarChart } from "react-icons/io5";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const latestSheet = await readLatestSheet();
  invariant(latestSheet, "No sheet exists");
  const sheet = await readSheet(latestSheet.id);
  invariant(!!sheet, "No sheet exists with this id");

  const leaders = await readSheetDashboard(latestSheet.id);

  return json({ sheet, leaders });
};

export default function Dashboard() {
  const { sheet, leaders } = useLoaderData<typeof loader>();
  const [viewMode, setViewMode] = useState<"grid" | "race">("race");

  const totalProps = sheet.propositions.length;
  const answeredProps = sheet.propositions.filter((p: any) => p.answerId).length;
  const progress = totalProps > 0 ? (answeredProps / totalProps) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-300 p-4">
      <div className="space-y-4">
        {/* Compact Header with View Toggle */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {sheet.title}
                </h1>
                {sheet.subtitle && (
                  <p className="text-sm text-base-content/70 mt-1">{sheet.subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="stats stats-horizontal shadow text-xs">
                  <div className="stat py-2 px-3">
                    <div className="stat-title text-[10px]">Players</div>
                    <div className="stat-value text-lg text-primary">{leaders.length}</div>
                  </div>
                  <div className="stat py-2 px-3">
                    <div className="stat-title text-[10px]">Progress</div>
                    <div className="stat-value text-lg text-secondary">
                      {answeredProps}/{totalProps}
                    </div>
                  </div>
                </div>

                <div className="btn-group shadow-lg">
                  <button
                    className={`btn btn-sm ${viewMode === "race" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setViewMode("race")}
                  >
                    <IoBarChart size={16} />
                    Race
                  </button>
                  <button
                    className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <IoGrid size={16} />
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional View Rendering */}
        {viewMode === "race" ? (
          <RaceView sheet={sheet} leaders={leaders} />
        ) : (
          <PropMatrix sheet={sheet} leaders={leaders} />
        )}
      </div>
    </div>
  );
}
