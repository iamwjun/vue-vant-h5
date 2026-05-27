# Repository Guidelines

## Project Overview
This repository is a Vue 3 + TypeScript H5 application built with Vite, Vue Router, Tailwind CSS v4, Vant 4, Axios, Mock.js, and `vite-plugin-mock`. The current business surface includes a recharge page and bill list/detail placeholders.

## Project Structure
- `src/main.ts` and `src/app/`: application bootstrap.
- `src/router/`: route definitions. Current routes are `/recharge`, `/bills`, and `/bills/:id`; `/` redirects to recharge.
- `src/layouts/`: shared route layouts. `AppShell.vue` hosts nested pages.
- `src/views/`: page screens, grouped by lowercase business domain. Keep bill list and bill detail under `src/views/bills/`.
- `src/components/`: reusable UI components.
- `src/api/`: typed HTTP endpoint wrappers. API wrapper paths should not include the `/api` base prefix.
- `src/services/`: domain orchestration helpers when API calls need page-independent composition.
- `src/types/`: shared TypeScript contracts exported through `src/types/index.ts`.
- `src/config/env.ts`: centralized environment access and validation.
- `src/styles/`: global CSS, Tailwind theme tokens, and Vant utility overrides.
- `src/assets/`: imported assets. Browser-served static files belong in `public/`.
- `mock/`: local mock handlers and mock datasets.

## Commands
Install dependencies with `npm install`.

- `npm run dev`: start Vite in development mode. Mock handlers are enabled for serve mode.
- `npm run dev:prod`: start Vite with production-mode env values.
- `npm run typecheck`: run `vue-tsc` without emitting files.
- `npm run build`: run production type-check and build.
- `npm run build:dev`: type-check and build with development mode.
- `npm run build:prod`: type-check and build with production mode.
- `npm run preview`: serve the latest `dist/` build locally.

## Environment
Required browser-exposed variables:

- `VITE_APP_TITLE`: app title used by route title updates.
- `VITE_API_BASE_URL`: Axios base URL. In development this is `/api`.
- `VITE_ENABLE_MOCK`: parsed by `src/config/env.ts`; the current Vite mock plugin is enabled in serve mode by `vite.config.ts`.

Do not commit `.env` or secrets. Commit only safe examples or mode defaults such as `.env.example`, `.env.development`, and `.env.production`.

## API And Mock Rules
- Use `src/api/http.ts` helpers (`get`, `post`, `put`, `del`) for request wrappers.
- Keep endpoint wrappers typed with contracts from `src/types/`.
- Because development `VITE_API_BASE_URL` is `/api`, API wrappers should call paths such as `/capital/wallet/recharge`, while mock route URLs should include `/api`, such as `/api/capital/wallet/recharge`.
- Mock endpoints live in `mock/index.ts`; reusable datasets can live in separate files such as `mock/list.ts`.
- Mock responses should use the shared business envelope: `{ code, message, data }`.

## Coding Style
- Use Vue SFCs with `<script setup lang="ts">`.
- Use 2-space indentation in `.vue`, `.ts`, and CSS files.
- Prefer `@/` imports over long relative paths.
- Name components in PascalCase, for example `RechargeView.vue`.
- Name domain view folders in lowercase, for example `src/views/bills/`.
- Keep TypeScript warnings at zero. There is no formatter or linter config, so match local style.
- Import Vant component styles next to the page/component using them when tree-shaking individual Vant modules.
- Keep UI text and route metadata consistent with the product language currently used in the app.

## Frontend Implementation Notes
- This is an H5/mobile-first app. Validate layouts at narrow mobile widths.
- Use Vant controls for common mobile interactions such as `NavBar`, `Button`, `Toast`, and `NumberKeyboard`.
- Keep fixed-format UI elements stable with explicit dimensions or responsive constraints.
- Do not use `Input` for the recharge amount field; the recharge page uses `NumberKeyboard`.

## Testing And Verification
There is no automated test suite yet. Before handing off changes:

- Run `npm run typecheck`.
- Run `npm run build`.
- Manually verify key flows with `npm run dev` or `npm run preview` when UI or routing changes are made.
- For mock/API work, verify the relevant local mock endpoint under the Vite dev server.

## Git And PR Standards
- Use focused Conventional Commit messages in English.
- Prefer enterprise-style subjects with a type and scope, for example `feat(recharge): implement wallet top-up workflow`.
- Include a concise body for non-trivial commits explaining the behavior and affected layers.
- Keep unrelated working tree changes out of commits.
- Pull requests should include summary, testing notes, linked issues when applicable, and screenshots or recordings for UI changes.
