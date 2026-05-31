import React from "react";
import { useRunStore } from "../state/useRunStore";

export function Header() {
  const runs = useRunStore((s) => s.runs);
  const selectedRunIds = useRunStore((s) => s.selectedRunIds);

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">AIDEEN Live Lab</h1>
        <span className="header-badge">v0.1</span>
      </div>
      <div className="header-right">
        <span className="header-stat">{runs.length} runs loaded</span>
        {selectedRunIds.length > 0 && (
          <span className="header-stat">
            {selectedRunIds.length} selected
          </span>
        )}
      </div>
    </header>
  );
}
