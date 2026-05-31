import React, { useState } from "react";
import { useRunStore } from "../state/useRunStore";
import * as api from "../api";
import { SAMPLE_LOG } from "../samples/sampleLog";

export function PasteImporter() {
  const importRun = useRunStore((s) => s.importRun);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [importing, setImporting] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleParse = async () => {
    if (!text.trim()) return;
    setImporting(true);
    setWarnings([]);
    try {
      const result = await api.parseLog(
        text,
        undefined,
        name.trim() || undefined
      );
      setWarnings(result.warnings);
      await importRun(result.run);
      setText("");
      setName("");
    } catch (err) {
      setWarnings([String(err)]);
    }
    setImporting(false);
  };

  const handleLoadSample = async () => {
    setText(SAMPLE_LOG);
    setName("Sample Run");
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Paste Log Text</h3>
      <textarea
        className="paste-textarea"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste AIDEEN log text here..."
      />
      <input
        className="name-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Run name (optional)"
      />
      <div className="button-row">
        <button
          className="btn btn-primary"
          onClick={handleParse}
          disabled={importing || !text.trim()}
        >
          {importing ? "Parsing..." : "Parse & Save"}
        </button>
        <button className="btn btn-secondary" onClick={handleLoadSample}>
          Load Sample Log
        </button>
      </div>
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
