import React from "react";

export function FutureLiveControlsPanel() {
  return (
    <div className="panel">
      <h3 className="panel-title">Future Live Controls</h3>
      <div className="future-live-placeholder">
        <p className="text-muted">Future Live Controls — not connected yet.</p>
        <div className="future-live-sections">
          <div className="detail-section">
            <h4>Runtime Controls (planned)</h4>
            <ul className="planned-controls">
              <li>fpm_gate_gain</li>
              <li>fpm_sim_high</li>
              <li>fpm_gate_min_bandwidth</li>
              <li>deq_damping</li>
              <li>pre_deq_context_lr</li>
              <li>entity_temperature</li>
            </ul>
          </div>
          <div className="detail-section">
            <h4>Structural / Restart Controls (planned)</h4>
            <ul className="planned-controls">
              <li>K</li>
              <li>seed</li>
              <li>FPM target</li>
              <li>FPM conditioning</li>
              <li>pre-DEQ context mode</li>
              <li>retrieval quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
