# AIDEEN Live Lab

Standalone dashboard for AIDEEN experiment logs and future live telemetry.

## Current capabilities

- Import AIDEEN `.log` files.
- Parse summaries and diagnostics.
- Persist runs in IndexedDB.
- Compare runs in tables.
- Visualize metrics with charts.
- Export JSON/CSV.

## Not implemented yet

- Direct model connection.
- WebSocket live telemetry.
- GPU-native charts.
- Runtime control sliders connected to AIDEEN.

## Run

```bash
npm install
npm run dev
```

## Build (Tauri desktop app)

```bash
npm run tauri build
```

## Future phases

- **UI-1:** Improve offline analytics and ranking.
- **UI-2:** Tail running log files.
- **UI-3:** Consume structured JSONL per-step metrics.
- **UI-4:** Connect to AIDEEN through WebSocket/IPC.
- **UI-5:** GPU-native visualization with wgpu.
