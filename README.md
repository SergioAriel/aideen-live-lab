# AIDEEN Live Lab

Desktop dashboard for inspecting AIDEEN training logs, full-validation results, FPM ablations, and per-run diagnostics.

## What It Does

AIDEEN Live Lab turns raw `.log` files into a local, explorable experiment dashboard. It is built for comparing FPM and no-FPM runs, checking validation behavior over time, and keeping the important publication metrics visible without digging through terminal output.

Core views include:

- Validation loss by step.
- Perplexity proxy by step.
- Training loss separated from validation loss.
- Gate/control traces for FPM behavior.
- Signal RMS diagnostics.
- Retrieval similarity and consolidation metrics.
- Full-validation comparisons across seeds and configs.
- Frozen FPM ablation deltas.
- Per-run tables with the key metrics needed for reporting.

<img width="3022" height="1886" alt="image" src="https://github.com/user-attachments/assets/508b7610-67da-42f4-acdf-d3deedd6108f" />

## Included Dataset

This repository includes one full-validation log set:

```text
data/logs/block_deq_train_fullval_16000
```

It contains 12 runs across seeds and configurations:

- `utility_aligned_delta`
- `mix0.25`
- `mix0.50`
- `no_fpm`

## Tech Stack

- Tauri desktop app.
- React + TypeScript frontend.
- Rust parser and local persistence layer.
- Recharts-based visualizations.
- Local-first storage; no remote service is required.

## Run Locally

```bash
npm install
npm run tauri dev
```

For the frontend-only Vite view:

```bash
npm run dev
```

## Build

```bash
npm run tauri build
```

## Notes

The app is focused on offline experiment inspection. It does not require a live model connection, and the included logs can be imported directly from the app using the folder importer.
