# FastAPI Full-Stack Frontend - AI Agent Instructions

## Architecture Overview

This is the **frontend** of a full-stack FastAPI template using:
- **Vite + React 19** with TypeScript and SWC
- **TanStack Router** (file-based routing with `routeTree.gen.ts` auto-generation)
- **TanStack Query** for server state management
- **shadcn/ui + Tailwind CSS v4** for UI components
- **Auto-generated OpenAPI client** from backend schema (`src/client/`)

Key architectural decision: **Feature-based organization** with shared components in `components/common/` and feature-specific logic in `components/features/{admin,items,settings}/`.

## Critical Workflows

### Client Generation
When backend OpenAPI schema changes, regenerate the TypeScript client:
```bash
npm run generate-client  # Uses openapi-ts.config.ts
```
- Auto-generates `src/client/` (schemas, types, SDK services)
- **Never manually edit** `src/client/` - it's ignored by Biome
- Services use class-based approach: `ItemsService.createItem()`, `UsersService.readUserMe()`

### Development
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run lint         # Biome check with auto-fix (--write --unsafe)
npm run build        # TypeScript check + Vite build
npx playwright test  # E2E tests (requires backend running)
```

### Testing with Playwright
- Backend must be running: `docker compose up -d --wait backend`
- Auth setup in `tests/auth.setup.ts` stores session to `playwright/.auth/user.json`
- Helper utilities in `tests/utils/` (mailcatcher, privateApi, random, user)

## Project-Specific Conventions

### Import Path Aliases
Use **typed barrel exports** via Vite/TSConfig aliases:
```typescript
import { DataTable } from "@/components/common"  // barrel export
import { AddItem } from "@/components/features/items"
import { queryKeys } from "@/api/keys"
import { useCrudMutation } from "@/hooks"
```
- `@/` maps to `src/`
- `@/common` → `src/components/common/index.ts` (barrel)
- `@/layout` → `src/components/layout/index.ts` (barrel)
- Feature directories use default exports: `export default AddItem`

### Query Key Factory Pattern
All TanStack Query keys use the centralized factory in `src/api/keys.ts`:
```typescript
queryKeys.items.all           // ["items"]
queryKeys.items.list({skip:0}) // ["items", "list", {skip:0}]
queryKeys.users.current()     // ["currentUser"]
```
When invalidating queries, use `queryKeys.items.all` to invalidate all item-related queries.

### Data Mutation Pattern
Use `useCrudMutation` hook for standardized CRUD operations (see `src/hooks/use-crud-mutation.ts`):
```typescript
const createMutation = useCrudMutation({
  mutationFn: (data: ItemCreate) => ItemsService.createItem({requestBody: data}),
  queryKey: queryKeys.items.all,
  successMessage: "Item created",
  invalidateAll: false  // only invalidate specific queryKey
})
```
Built-in toast notifications and error handling via `handleError` utility.

### Form Dialog Pattern
Reusable CRUD dialogs via `EntityFormDialog` component (`src/components/common/entity-form-dialog.tsx`):
- Supports add/edit modes with Zod validation
- Controlled/uncontrolled open state
- Renders as Button or DropdownMenuItem trigger
- See `src/components/features/items/add-item.tsx` for reference

### Error Handling
Centralized error extraction in `src/utils/error-handling.ts`:
```typescript
handleError.call(showErrorToast, error)  // Binds toast function as `this`
```
Extracts error messages from Axios errors or FastAPI `detail` field (handles both string and array formats).

### Routing with TanStack Router
- **File-based routes** in `src/routes/` → `routeTree.gen.ts` (auto-generated)
- Protected routes use `_layout` prefix: `src/routes/_layout.tsx` checks `isLoggedIn()`
- Route components: `createFileRoute("/_layout/items")` with `component`, `head`, `beforeLoad` exports
- Use `useSuspenseQuery` + `<Suspense>` for data loading in routes (see `_layout/items.tsx`)

### Authentication
- Token stored in `localStorage` as `access_token`
- `useAuth` hook provides: `user`, `loginMutation`, `logoutMutation`, `signUpMutation`
- Current user fetched with `queryKey: ["currentUser"]`, enabled only when token exists
- OpenAPI client configured in `src/client/core/OpenAPI.ts` to include token in headers

## Code Style (Biome)

- **Semicolons**: ASI mode (`asNeeded` - omit where possible)
- **Quotes**: Double quotes
- **Formatting**: 2-space indent, self-closing elements enforced
- **Linting exceptions**: `noExplicitAny` and `noArrayIndexKey` disabled
- **Auto-fix on save**: Run `npm run lint` to apply fixes
- Excludes: `src/client/`, `src/routeTree.gen.ts`, `src/components/ui/` (shadcn)

## UI Components (shadcn/ui)

- Components in `src/components/ui/` are **shadcn primitives** (Button, Dialog, Table, etc.)
- Based on Radix UI with Tailwind CSS v4
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Theme provider in `src/providers/theme-provider.tsx` (light/dark/system)
- Custom toast via `useCustomToast` hook wrapping `sonner`

## Integration Points

- **Backend API**: Configured via `VITE_API_URL` env var (defaults to Docker backend)
- **OpenAPI Client**: Axios-based, class services, auto-generated from `/api/v1/openapi.json`
- **Auth Flow**: Form-data login → `access_token` in localStorage → included in all requests
- **Router Devtools**: TanStack Router + React Query devtools enabled in dev mode
