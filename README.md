# Family Asset Tracker

Track a household's assets and liabilities with a lightweight React dashboard. The app runs entirely in the browser, keeps data in `localStorage`, and ships with a demo dataset so you can explore without creating records first.

## Features
- Dashboard with net worth, asset/liability totals, allocation by category or account, and monthly wealth trend (Recharts).
- Add assets or liabilities with owner/account autocomplete, currency selection, and optional notes.
- History view with filtering by account/owner/category, pagination, and delete actions (guarded in demo mode).
- Settings to change language (English, Français, 简体中文) and default currency with static FX conversions for aggregation.
- Data controls to export CSV for spreadsheets, create JSON backups, restore from JSON, and exit demo mode to start clean.

## Getting Started
Prerequisites: Node.js 18+

```bash
npm install
npm run dev
```

Visit the printed localhost URL to use the app. The app runs fully client-side; no additional services are required.

## Build for Production
```bash
npm run build
npm run preview   # optional local preview
```
Static assets are emitted to `dist/`.

## Data & Demo Mode
- First load defaults to demo mode. Exit demo from **Settings → Exit Demo & Clear Data** to start with an empty ledger.
- Personal records persist in `localStorage` keys prefixed with `fat_`.
- Exports are CSV (for Excel/Sheets) and JSON (backup/restore). Restoring a JSON file overwrites current data after confirmation.

## Tech Stack
- React 19, Vite, TypeScript
- Tailwind (CDN) for styling
- Recharts for visualization
- lucide-react for icons
