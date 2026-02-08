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
import RaceToBottom from "./components/RaceToBottom";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-300 p-6">
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex justify-center">
          <div className="btn-group shadow-lg">
            <button
              className={`btn ${viewMode === "race" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setViewMode("race")}
            >
              <IoBarChart size={20} />
              Race View
            </button>
            <button
              className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setViewMode("grid")}
            >
              <IoGrid size={20} />
              Grid View
            </button>
          </div>
        </div>

        {/* Race to Bottom Widget - show in both views */}
        <RaceToBottom leaders={leaders} />

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
