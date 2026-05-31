import React from "react";
import { AppShell } from "./components/AppShell";
import { useRunStore } from "./state/useRunStore";

export default function App() {
  const loadAllRuns = useRunStore((s) => s.loadAllRuns);
  const loading = useRunStore((s) => s.loading);
  const error = useRunStore((s) => s.error);

  React.useEffect(() => {
    loadAllRuns();
  }, [loadAllRuns]);

  if (loading && error === null) {
    return (
      <div className="app-loading">
        <p>Loading runs from database...</p>
      </div>
    );
  }

  return (
    <>
      {error && <div className="app-error">Error: {error}</div>}
      <AppShell />
    </>
  );
}
