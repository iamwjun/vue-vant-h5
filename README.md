# vue-vant-h5

A mobile H5 project built with Vue 3, TypeScript, and Vite. It uses Vant 4 for interactive components, Tailwind CSS v4 for foundational styling, Axios for centralized requests, and `vite-plugin-mock` with Mock.js for local mocks.

The current business pages include recharge, bill list, and bill detail. `/` redirects to the recharge page by default.

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Vant 4
- Tailwind CSS v4
- Axios
- Mock.js
- vite-plugin-mock

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Development mode reads `.env.development` by default:

```env
VITE_APP_TITLE=Recharge example
VITE_API_BASE_URL=/api
VITE_ENABLE_MOCK=true
```

After the development server starts, visit:

```text
http://127.0.0.1:5173/recharge
```

## Common Commands

```bash
npm run dev
npm run dev:prod
npm run typecheck
npm run build
npm run build:dev
npm run build:prod
npm run preview
```

Command descriptions:

- `npm run dev`: Start Vite in development mode with local mocks enabled.
- `npm run dev:prod`: Start Vite in production mode.
- `npm run typecheck`: Run `vue-tsc --noEmit`.
- `npm run build`: Run the production build, equivalent to `npm run build:prod`.
- `npm run preview`: Preview the latest `dist/` build output.

## Directory Structure

```text
.
├── mock/                  # Local mock endpoints and mock data
├── public/                # Static assets served directly by the browser
├── src/
│   ├── api/               # Axios API wrappers
│   ├── app/               # Application root component
│   ├── assets/            # Assets imported by source code
│   ├── components/        # Reusable components
│   ├── config/            # Environment variables and runtime configuration
│   ├── layouts/           # Page layouts
│   ├── router/            # Route configuration
│   ├── services/          # Business service orchestration
│   ├── styles/            # Global styles, Tailwind tokens, and Vant overrides
│   ├── types/             # Shared types
│   ├── utils/             # General utility functions
│   └── views/             # Pages
└── vite.config.ts
```

Page directories:

```text
src/views/recharge/RechargeView.vue
src/views/bills/BillsView.vue
src/views/bills/BillDetailView.vue
```

## Routing

Routes are centralized in `src/router/index.ts`.

| Path | Name | Page |
| --- | --- | --- |
| `/` | - | redirect to `recharge-center` |
| `/recharge` | `recharge-center` | Recharge |
| `/bills` | `bills` | Bill list |
| `/bills/:id` | `bill-detail` | Bill detail |

Page titles are set automatically in `router.afterEach` based on `route.meta.title` and `VITE_APP_TITLE`.

## API Development Conventions

The core request utilities live in `src/api/http.ts`:

- Automatically reads `VITE_API_BASE_URL`
- Automatically attaches the local `access_token`
- Handles the `{ code, data, message }` response structure consistently
- Handles error toasts consistently

Business APIs are organized by domain under `src/api/`. For example, wallet APIs:

```ts
fetchWalletBalanceApi(tenantId)
submitWalletRechargeApi(params)
```

Note: Do not include the `/api` prefix in API wrappers. In development, `VITE_API_BASE_URL=/api` adds it automatically. For example:

```ts
post('/capital/wallet/recharge', params)
```

The corresponding mock URL must include `/api`:

```ts
url: '/api/capital/wallet/recharge'
```

## Mock Development

Local mocks are loaded by `vite-plugin-mock` and configured in `vite.config.ts`:

```ts
viteMockServe({
  mockPath: 'mock',
  enable: command === 'serve',
  logger: true,
})
```

Current mock content:

- `mock/index.ts`
  - `GET /api/capital/wallet/:tenantId/balance`
  - `POST /api/capital/wallet/recharge`
  - Sample user login and user information endpoints
- `mock/list.ts`
  - `bills`: bill data for the last 3 months, 36 records per month, 108 records in total
  - Provides both flat `list` data and monthly aggregated `groups`

Mock responses should keep a consistent format:

```ts
{
  code: 200,
  message: 'ok',
  data: {}
}
```

## Recharge Page

The recharge page is located at `src/views/recharge/RechargeView.vue` and includes:

- Vant `NavBar`
- Balance lookup
- Entry point to the bill list
- Fixed amount selection, starting from `50` by default
- Vant `NumberKeyboard` amount input
- Mock recharge success toast

After a successful recharge, the page display is updated with the balance returned by the API.

## Type Conventions

Shared types live in `src/types/` and are exported through `src/types/index.ts`.

When adding a new API, also add:

1. Request parameter types
2. Response data types
3. Generic constraints for API functions
4. Mock response fields

## Style Conventions

- Global entry: `src/styles/index.css`
- Tailwind tokens: `src/styles/tailwind/theme.css`
- Base styles: `src/styles/tailwind/base.css`
- Vant override utilities: `src/styles/utilities/vant.css`
- Common utilities: `src/styles/utilities/common.css`

When developing pages, prefer the tokens and component style already used in this project. For mobile pages, pay special attention to text wrapping, button sizes, and fixed-area overlap at narrow widths.

## Verification Flow

Before submitting, run at least:

```bash
npm run typecheck
npm run build
```

For UI or routing changes, also run:

```bash
npm run dev
```

Then manually verify key paths, such as:

- `/recharge`
- `/bills`
- `/bills/:id`

For mock endpoint changes, you can request the endpoint directly after the development server starts:

```bash
curl http://127.0.0.1:5173/api/capital/wallet/demo-tenant/balance
```

## Commit Convention

Use English Conventional Commits and keep each commit focused.

Examples:

```text
feat(recharge): implement wallet top-up workflow
feat(billing): add bill views and grouped mock data
chore(project): bootstrap Vue Vant H5 application
```

For non-trivial commits, add a body that explains the behavior changes, affected areas, and verification results.

## Configuration And Security

- Do not commit `.env`.
- Browser-visible variables must start with `VITE_`.
- Environment variable access is centralized in `src/config/env.ts`.
- Do not write real API URLs, secrets, or tokens into source code or mock data.
