import React, { useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useRunStore } from "../state/useRunStore";
import { useLogWatcher } from "../hooks/useLogWatcher";
import * as api from "../api";

export function LogImporter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const importRun = useRunStore((s) => s.importRun);
  const watchedRun = useRunStore((s) => s.watchedRun);
  const [importing, setImporting] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const { startWatching, stopWatching } = useLogWatcher();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImporting(true);
    setWarnings([]);
    const allWarnings: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const result = await api.parseLog(text, file.name, undefined);
        allWarnings.push(...result.warnings.map((w) => `${file.name}: ${w}`));
        await importRun(result.run);
      } catch (err) {
        allWarnings.push(`${file.name}: ${String(err)}`);
      }
    }

    setWarnings(allWarnings);
    setImporting(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleWatchFile = async () => {
    try {
      // Use Tauri native dialog to get the actual file path
      const selected = await open({
        multiple: false,
        filters: [{ name: "Log Files", extensions: ["log", "txt"] }],
      });

      if (!selected) return;

      const path = selected as string;
      const fileName = path.split("/").pop() || path.split("\\").pop() || path;

      await startWatching(path, fileName);
      setWarnings([`Watching ${fileName}...`]);
    } catch (err) {
      setWarnings([`Error watching file: ${String(err)}`]);
    }
  };

  const handleStopWatching = async () => {
    if (watchedRun) {
      await stopWatching(watchedRun.path);
      setWarnings([]);
    }
  };

  const handleImportFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (!selected) return;

      const path = selected as string;
      setImporting(true);
      setWarnings([]);

      const result = await api.importLogsFromDir(path, 120);
      await useRunStore.getState().loadAllRuns();
      setWarnings([
        `Imported ${result.imported} logs from ${path}. Skipped ${result.skipped}.`,
        ...result.warnings.slice(0, 12),
      ]);
    } catch (err) {
      setWarnings([`Error importing folder: ${String(err)}`]);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Import Log Files</h3>
      <input
        ref={inputRef}
        type="file"
        accept=".log,.txt"
        multiple
        onChange={handleFiles}
        disabled={importing}
        className="file-input"
      />
      {importing && <p className="text-muted">Importing...</p>}
      <div className="button-row">
        <button className="btn btn-secondary" onClick={handleImportFolder} disabled={importing}>
          Import Folder
        </button>
      </div>

      <hr className="divider" />

      <h4 className="panel-subtitle">Live Watch</h4>
      {watchedRun ? (
        <div className="watch-status">
          <p className="watch-active">
            <span className="watch-dot">🔴</span> Watching: {watchedRun.displayName}
            <br />
            <span className="text-muted">
              Lines read: {watchedRun.totalLines} | Steps: {watchedRun.run.points.length}
            </span>
          </p>
          <button className="btn btn-danger" onClick={handleStopWatching}>
            Stop Watching
          </button>
        </div>
      ) : (
        <>
          <p className="text-muted">Watch a log file for live updates:</p>
          <button className="btn btn-primary" onClick={handleWatchFile}>
            Select File to Watch
          </button>
        </>
      )}

      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((w, i) => (
            <p key={i} className="warning-text">
              {w}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
