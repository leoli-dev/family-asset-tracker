# Repository Guidelines

## Project Structure & Module Organization
- `index.tsx` bootstraps the React 19 app and renders `App.tsx`, which controls navigation between dashboard, entry, history, and settings views.
- `components/` contains feature-focused UI (e.g., `Dashboard.tsx`, `EntryForm.tsx`, `HistoryTable.tsx`, `Settings.tsx`, `Nav.tsx`) using Tailwind-style utility classes.
- `utils/` holds helpers (`demoData.ts`, `dataHelpers.ts`, `translations.ts`) and shared constants live in `constants.ts`; domain types are in `types.ts`.
- `services/geminiService.ts` wraps Google GenAI logo generation; it expects `API_KEY` in the environment and returns a base64 data URL.
- Assets are primarily CSS-in-JS classes; static HTML shell lives in `index.html`. Vite tooling is configured in `vite.config.ts` and `tsconfig.json`.

## Build, Test, and Development Commands
- Install deps once: `npm install`.
- Local dev with hot reload: `npm run dev` (starts Vite on the default port).
- Production build: `npm run build` (outputs to `dist/`).
- Preview the production build locally: `npm run preview`.

## Coding Style & Naming Conventions
- TypeScript + React functional components; prefer hooks over class components. Use single quotes, 2-space indent, and explicit prop types/interfaces from `types.ts`.
- Organize UI into small, reusable components under `components/`; keep helper logic in `utils/` or discreet service modules.
- Styling uses Tailwind-like utility classes inline; avoid ad-hoc global styles.
- Keep side effects (e.g., LocalStorage) in `useEffect` blocks with clear dependency arrays. Handle null/undefined guards for stored data.

## Testing Guidelines
- No automated test suite is present yet. When adding tests, prefer Vitest + React Testing Library for components and add a `test` npm script.
- Until then, manually verify core flows in `npm run dev`: record creation, history deletion, demo mode entry/exit, and settings (currency/language/logo) persistence via LocalStorage.
- For service changes involving GenAI, confirm `API_KEY` is set and avoid committing secrets; mock the service in tests when added.

## Commit & Pull Request Guidelines
- Match existing history: short, imperative, Conventional Commit style where helpful (e.g., `feat: add demo mode toggle`, `chore: tidy translations`).
- Include PR descriptions that state the change, rationale, and user impact; link related issues. Add before/after screenshots or GIFs for UI tweaks.
- List verification steps (commands run, manual checks) so reviewers can reproduce quickly. Keep PRs scoped; prefer follow-ups over large mixed changes.

## Security & Configuration Tips
- Never commit `.env` or API keys. Set `API_KEY` in your shell before running GenAI features (`export API_KEY=...`).
- User data persists in LocalStorage under `fat_*` keys; clearing storage resets the app. When testing destructive actions, back up data or use demo mode.
