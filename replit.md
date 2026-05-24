# NETCO VPN Platform

A premium VPN config selling platform for Kenya — sells device-locked VPN configurations for HTTP Custom and HTTP Injector apps on Safaricom, Airtel, and Telkom networks, with M-Pesa payments.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port from $PORT)
- `pnpm --filter @workspace/netco run dev` — run the web frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session signing key

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, TailwindCSS v4, shadcn/ui components, Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/netco/` — React+Vite frontend (preview path `/`)
- `artifacts/api-server/` — Express API server (preview path `/api`)
- `lib/api-client-react/` — Generated React Query hooks (Orval output)
- `lib/api-zod/` — Generated Zod schemas (Orval output)
- `lib/api-spec/` — OpenAPI spec source of truth (`openapi.yaml`)
- `lib/db/` — Drizzle ORM schema + DB client
- `scripts/` — Utility scripts

## Architecture decisions

- **Contract-first API**: OpenAPI spec defined in `lib/api-spec/openapi.yaml`, hooks/schemas generated via Orval. Never edit generated files manually.
- **Device-locked configs**: All VPN configs are tied to a Device ID (HTTP Custom) or HWID (HTTP Injector) provided at checkout. Prevents sharing.
- **M-Pesa STK Push simulation**: Payment initiation sends a simulated STK push; auto-completes after 15 seconds for demo. Real PayFlow API integration is the next step.
- **No auth required**: Customers can purchase configs without an account. Plans are looked up by phone number or Device ID on the Dashboard/Check Expiry pages.
- **Express 5 return pattern**: All route handlers use explicit `return` before `res.json()` or call `res.json()` then `return` separately to satisfy TypeScript's "not all code paths return a value" rule.

## Product

- **Home**: Hero with stats (active users, servers, uptime)
- **Pricing**: Network tabs (Safaricom/Airtel/Telkom) → Category tabs → Duration (Daily/Weekly/Monthly) → Plan cards with M-Pesa checkout
- **Checkout**: 4-step flow — Plan Summary → App + Device ID → M-Pesa phone → Payment status (STK Push polling)
- **Dashboard**: Look up active/expired plans by phone or Device ID
- **Check Expiry**: Quick expiry checker with renewal CTA
- **How to Connect**: Step-by-step guide for HTTP Custom (.hc) and HTTP Injector (.ehi)
- **Server Status**: Real-time server grid grouped by network with load/ping metrics
- **FAQs**: Categorized FAQ accordion
- **Contact**: Form + WhatsApp/Telegram/Email quick links
- **Admin**: Revenue by month (bar chart) + revenue by network (pie chart) + monthly table
- **Terms**: Full terms of service

## User preferences

- Dark cyberpunk theme: background `#0A0E27`, cyan `#00F5FF` (primary), purple `#7B61FF` (secondary)
- All UI built with the glass-card aesthetic (backdrop-blur, subtle borders)
- No drop shadows — glow effects only (`.glow-primary`, `.glow-secondary`)

## Gotchas

- Always run `pnpm run typecheck:libs` after editing `lib/db/` schema, then restart api-server workflow
- After changing OpenAPI spec, run `pnpm --filter @workspace/api-spec run codegen` before typechecking frontend
- Do not run `pnpm dev` at workspace root — use workflow restart instead
- `@/components/layout` barrel export is at `artifacts/netco/src/components/layout/index.ts`
