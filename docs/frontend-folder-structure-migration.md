# Frontend Folder Structure Migration Plan

> **Author**: Winston (Architect)
> **Date**: 2025-12-29
> **Status**: Draft

---

## Executive Summary

This document outlines a phased migration plan to restructure the frontend codebase for improved maintainability, scalability, and developer experience. The migration is designed to be incremental, allowing the team to continue development while changes are rolled out.

---

## Current State Analysis

### Existing Structure

```
frontend/src/
├── client/           # Auto-generated OpenAPI client
├── components/
│   ├── Admin/        # PascalCase
│   ├── Common/       # PascalCase
│   ├── Items/        # PascalCase
│   ├── Pending/      # PascalCase
│   ├── Sidebar/      # PascalCase
│   ├── ui/           # lowercase (shadcn)
│   ├── UserSettings/ # PascalCase
│   └── theme-provider.tsx
├── hooks/
├── lib/
│   └── utils.ts      # cn() function
├── routes/
├── utils.ts          # Error handling, getInitials
└── main.tsx
```

### Identified Issues

| Issue | Description | Impact |
|-------|-------------|--------|
| **Inconsistent naming** | Mix of PascalCase and kebab-case folders | Developer confusion |
| **Duplicate utilities** | `src/utils.ts` and `src/lib/utils.ts` coexist | Maintenance overhead |
| **No API layer** | Query options defined inline in route files | Poor reusability |
| **No types folder** | TypeScript types scattered across files | Discoverability issues |
| **No constants/config** | Hardcoded values in components | Change management difficulty |
| **Loose providers** | `theme-provider.tsx` in components root | Inconsistent organization |
| **No barrel exports** | Each component imported individually | Verbose imports |

---

## Target State

### Proposed Structure

```
frontend/src/
├── api/                          # API layer
│   ├── queries/                  # React Query query options
│   │   ├── items.queries.ts
│   │   ├── users.queries.ts
│   │   └── index.ts
│   ├── mutations/                # React Query mutations
│   │   ├── auth.mutations.ts
│   │   ├── items.mutations.ts
│   │   ├── users.mutations.ts
│   │   └── index.ts
│   └── keys.ts                   # Query key factory
│
├── client/                       # Auto-generated (unchanged)
│   ├── core/
│   ├── index.ts
│   ├── schemas.gen.ts
│   ├── sdk.gen.ts
│   └── types.gen.ts
│
├── components/
│   ├── ui/                       # shadcn primitives (unchanged)
│   ├── common/                   # Shared components
│   │   ├── data-table.tsx
│   │   ├── error-component.tsx
│   │   ├── logo.tsx
│   │   ├── not-found.tsx
│   │   ├── appearance.tsx
│   │   └── index.ts
│   ├── layout/                   # Layout components
│   │   ├── app-sidebar.tsx
│   │   ├── auth-layout.tsx
│   │   ├── sidebar-main.tsx
│   │   ├── sidebar-user.tsx
│   │   ├── footer.tsx
│   │   └── index.ts
│   └── features/                 # Feature-based components
│       ├── admin/
│       │   ├── add-user.tsx
│       │   ├── edit-user.tsx
│       │   ├── delete-user.tsx
│       │   ├── user-actions-menu.tsx
│       │   ├── columns.tsx
│       │   └── index.ts
│       ├── items/
│       │   ├── add-item.tsx
│       │   ├── edit-item.tsx
│       │   ├── delete-item.tsx
│       │   ├── item-actions-menu.tsx
│       │   ├── columns.tsx
│       │   ├── pending-items.tsx
│       │   └── index.ts
│       └── settings/
│           ├── change-password.tsx
│           ├── delete-account.tsx
│           ├── delete-confirmation.tsx
│           ├── user-information.tsx
│           └── index.ts
│
├── config/                       # Application configuration
│   ├── constants.ts
│   ├── routes.ts
│   └── env.ts
│
├── hooks/                        # Custom hooks
│   ├── use-auth.ts
│   ├── use-mobile.ts
│   ├── use-copy-to-clipboard.ts
│   ├── use-custom-toast.ts
│   └── index.ts
│
├── lib/                          # Third-party utilities
│   └── utils.ts                  # cn() only
│
├── providers/                    # React context providers
│   ├── theme-provider.tsx
│   ├── query-provider.tsx
│   └── index.ts
│
├── routes/                       # TanStack Router (unchanged structure)
│   ├── _layout/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── recover-password.tsx
│   ├── reset-password.tsx
│   ├── signup.tsx
│   └── __root.tsx
│
├── types/                        # Shared TypeScript types
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/                        # Utility functions
│   ├── error-handling.ts
│   ├── string.ts
│   └── index.ts
│
├── index.css
├── main.tsx
├── routeTree.gen.ts
└── vite-env.d.ts
```

---

## Migration Phases

### Phase 1: Foundation (Low Risk)

**Objective**: Establish new folders and consolidate utilities without breaking changes.

#### Step 1.1: Create New Folders

```bash
mkdir -p src/api/queries src/api/mutations
mkdir -p src/config
mkdir -p src/providers
mkdir -p src/types
mkdir -p src/utils
```

#### Step 1.2: Consolidate Utilities

**Action**: Move `src/utils.ts` contents to `src/utils/`

```typescript
// src/utils/error-handling.ts
import { AxiosError } from "axios"
import type { ApiError } from "@/client"

function extractErrorMessage(err: ApiError): string {
  if (err instanceof AxiosError) {
    return err.message
  }

  const errDetail = (err.body as any)?.detail
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    return errDetail[0].msg
  }
  return errDetail || "Something went wrong."
}

export const handleError = function (
  this: (msg: string) => void,
  err: ApiError,
) {
  const errorMessage = extractErrorMessage(err)
  this(errorMessage)
}
```

```typescript
// src/utils/string.ts
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
```

```typescript
// src/utils/index.ts
export * from './error-handling'
export * from './string'
```

**Action**: Update imports across codebase

```typescript
// Before
import { handleError } from "@/utils"

// After
import { handleError } from "@/utils"  // Same path, barrel export
```

**Action**: Delete `src/utils.ts` after migration

#### Step 1.3: Create Query Key Factory

```typescript
// src/api/keys.ts
export const queryKeys = {
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (params?: { skip?: number; limit?: number }) =>
      [...queryKeys.users.lists(), params] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },

  // Items
  items: {
    all: ['items'] as const,
    lists: () => [...queryKeys.items.all, 'list'] as const,
    list: (params?: { skip?: number; limit?: number }) =>
      [...queryKeys.items.lists(), params] as const,
    details: () => [...queryKeys.items.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.items.details(), id] as const,
  },
} as const
```

#### Step 1.4: Create Config Folder

```typescript
// src/config/constants.ts
export const APP_NAME = 'FastAPI Cloud'
export const DEFAULT_PAGE_SIZE = 100

export const AUTH = {
  TOKEN_KEY: 'access_token',
} as const
```

```typescript
// src/config/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  RECOVER_PASSWORD: '/recover-password',
  RESET_PASSWORD: '/reset-password',
  SETTINGS: '/settings',
  ITEMS: '/items',
  ADMIN: '/admin',
} as const
```

```typescript
// src/config/env.ts
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const
```

**Verification**: Run `npm run build` to ensure no breaking changes.

---

### Phase 2: API Layer (Medium Risk)

**Objective**: Extract query options and mutations into dedicated layer.

#### Step 2.1: Create Query Options

```typescript
// src/api/queries/users.queries.ts
import { UsersService } from '@/client'
import { queryKeys } from '../keys'

export const usersQueryOptions = {
  current: () => ({
    queryKey: queryKeys.users.current(),
    queryFn: UsersService.readUserMe,
  }),

  list: (params = { skip: 0, limit: 100 }) => ({
    queryKey: queryKeys.users.list(params),
    queryFn: () => UsersService.readUsers(params),
  }),

  detail: (id: string) => ({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => UsersService.readUserById({ userId: id }),
  }),
}
```

```typescript
// src/api/queries/items.queries.ts
import { ItemsService } from '@/client'
import { queryKeys } from '../keys'

export const itemsQueryOptions = {
  list: (params = { skip: 0, limit: 100 }) => ({
    queryKey: queryKeys.items.list(params),
    queryFn: () => ItemsService.readItems(params),
  }),

  detail: (id: string) => ({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => ItemsService.readItem({ id }),
  }),
}
```

```typescript
// src/api/queries/index.ts
export * from './users.queries'
export * from './items.queries'
```

#### Step 2.2: Create Mutations

```typescript
// src/api/mutations/auth.mutations.ts
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoginService, UsersService } from '@/client'
import type { Body_login_login_access_token, UserRegister } from '@/client'
import { AUTH } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { queryKeys } from '../keys'

export const useLoginMutation = (onError: (err: unknown) => void) => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: Body_login_login_access_token) => {
      const response = await LoginService.loginAccessToken({ formData: data })
      localStorage.setItem(AUTH.TOKEN_KEY, response.access_token)
      return response
    },
    onSuccess: () => navigate({ to: ROUTES.HOME }),
    onError,
  })
}

export const useSignUpMutation = (onError: (err: unknown) => void) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onSuccess: () => navigate({ to: ROUTES.LOGIN }),
    onError,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  })
}
```

```typescript
// src/api/mutations/items.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ItemsService } from '@/client'
import type { ItemCreate, ItemUpdate } from '@/client'
import { queryKeys } from '../keys'

export const useCreateItemMutation = (onError: (err: unknown) => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ItemCreate) =>
      ItemsService.createItem({ requestBody: data }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
    onError,
  })
}

export const useUpdateItemMutation = (onError: (err: unknown) => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemUpdate }) =>
      ItemsService.updateItem({ id, requestBody: data }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
    onError,
  })
}

export const useDeleteItemMutation = (onError: (err: unknown) => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ItemsService.deleteItem({ id }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),
    onError,
  })
}
```

```typescript
// src/api/mutations/index.ts
export * from './auth.mutations'
export * from './items.mutations'
```

#### Step 2.3: Update Route Files

```typescript
// src/routes/_layout/items.tsx
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { Suspense } from "react"

import { itemsQueryOptions } from "@/api/queries"  // NEW
import { DataTable } from "@/components/Common/DataTable"
import AddItem from "@/components/Items/AddItem"
import { columns } from "@/components/Items/columns"
import PendingItems from "@/components/Pending/PendingItems"

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  head: () => ({
    meta: [{ title: "Items - FastAPI Cloud" }],
  }),
})

function ItemsTableContent() {
  const { data: items } = useSuspenseQuery(itemsQueryOptions.list())  // UPDATED
  // ... rest unchanged
}
```

**Verification**: Test all CRUD operations for Items and Users.

---

### Phase 3: Providers (Low Risk)

**Objective**: Centralize React context providers.

#### Step 3.1: Move Theme Provider

```bash
mv src/components/theme-provider.tsx src/providers/theme-provider.tsx
```

#### Step 3.2: Create Query Provider

```typescript
// src/providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

#### Step 3.3: Create Barrel Export

```typescript
// src/providers/index.ts
export { ThemeProvider } from './theme-provider'
export { QueryProvider } from './query-provider'
```

#### Step 3.4: Update main.tsx

```typescript
// src/main.tsx
import { ThemeProvider, QueryProvider } from '@/providers'
// ... rest of imports

// Update provider composition
```

**Verification**: Ensure theme switching and queries still work.

---

### Phase 4: Component Reorganization (High Risk)

**Objective**: Restructure components into consistent naming and organization.

#### Step 4.1: Rename Folders to kebab-case

```bash
# Rename existing folders
mv src/components/Common src/components/common
mv src/components/Admin src/components/features/admin
mv src/components/Items src/components/features/items
mv src/components/UserSettings src/components/features/settings
mv src/components/Sidebar src/components/layout
mv src/components/Pending src/components/features/items  # Merge
```

#### Step 4.2: Rename Files to kebab-case

| Old Path | New Path |
|----------|----------|
| `Common/DataTable.tsx` | `common/data-table.tsx` |
| `Common/ErrorComponent.tsx` | `common/error-component.tsx` |
| `Admin/AddUser.tsx` | `features/admin/add-user.tsx` |
| `Admin/EditUser.tsx` | `features/admin/edit-user.tsx` |
| `Items/AddItem.tsx` | `features/items/add-item.tsx` |
| `Sidebar/AppSidebar.tsx` | `layout/app-sidebar.tsx` |
| ... | ... |

#### Step 4.3: Create Barrel Exports

```typescript
// src/components/common/index.ts
export { DataTable } from './data-table'
export { ErrorComponent } from './error-component'
export { Logo } from './logo'
export { NotFound } from './not-found'
export { Appearance } from './appearance'
```

```typescript
// src/components/features/admin/index.ts
export { AddUser } from './add-user'
export { EditUser } from './edit-user'
export { DeleteUser } from './delete-user'
export { UserActionsMenu } from './user-actions-menu'
export { columns as userColumns } from './columns'
```

```typescript
// src/components/features/items/index.ts
export { AddItem } from './add-item'
export { EditItem } from './edit-item'
export { DeleteItem } from './delete-item'
export { ItemActionsMenu } from './item-actions-menu'
export { PendingItems } from './pending-items'
export { columns as itemColumns } from './columns'
```

```typescript
// src/components/layout/index.ts
export { AppSidebar } from './app-sidebar'
export { AuthLayout } from './auth-layout'
export { SidebarMain } from './sidebar-main'
export { SidebarUser } from './sidebar-user'
export { Footer } from './footer'
```

#### Step 4.4: Update All Imports

Use search-and-replace across codebase:

```typescript
// Before
import { DataTable } from "@/components/Common/DataTable"
import AddItem from "@/components/Items/AddItem"

// After
import { DataTable } from "@/components/common"
import { AddItem } from "@/components/features/items"
```

**Verification**: Full application smoke test, all routes accessible.

---

### Phase 5: Types & Hooks (Low Risk)

**Objective**: Centralize shared types and standardize hook naming.

#### Step 5.1: Create Types Folder

```typescript
// src/types/common.types.ts
export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
}
```

```typescript
// src/types/index.ts
export * from './common.types'
```

#### Step 5.2: Rename Hooks to kebab-case

```bash
mv src/hooks/useAuth.ts src/hooks/use-auth.ts
mv src/hooks/useMobile.ts src/hooks/use-mobile.ts
mv src/hooks/useCopyToClipboard.ts src/hooks/use-copy-to-clipboard.ts
mv src/hooks/useCustomToast.ts src/hooks/use-custom-toast.ts
```

#### Step 5.3: Create Hooks Barrel Export

```typescript
// src/hooks/index.ts
export { default as useAuth, isLoggedIn } from './use-auth'
export { useMobile } from './use-mobile'
export { useCopyToClipboard } from './use-copy-to-clipboard'
export { useCustomToast } from './use-custom-toast'
```

**Verification**: All hooks importable from `@/hooks`.

---

### Phase 6: Path Aliases (Low Risk)

**Objective**: Add granular path aliases for cleaner imports.

#### Step 6.1: Update tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/api": ["./src/api/index.ts"],
      "@/api/*": ["./src/api/*"],
      "@/components/*": ["./src/components/*"],
      "@/common": ["./src/components/common/index.ts"],
      "@/features/*": ["./src/components/features/*"],
      "@/layout": ["./src/components/layout/index.ts"],
      "@/ui/*": ["./src/components/ui/*"],
      "@/config": ["./src/config/index.ts"],
      "@/config/*": ["./src/config/*"],
      "@/hooks": ["./src/hooks/index.ts"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/providers": ["./src/providers/index.ts"],
      "@/types": ["./src/types/index.ts"],
      "@/utils": ["./src/utils/index.ts"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}
```

#### Step 6.2: Update vite.config.ts

```typescript
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/api': resolve(__dirname, './src/api'),
      '@/common': resolve(__dirname, './src/components/common'),
      '@/features': resolve(__dirname, './src/components/features'),
      '@/layout': resolve(__dirname, './src/components/layout'),
      '@/ui': resolve(__dirname, './src/components/ui'),
      '@/config': resolve(__dirname, './src/config'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/providers': resolve(__dirname, './src/providers'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
})
```

**Verification**: `npm run build` passes, IDE resolves all paths.

---

## Verification Checklist

After each phase, verify:

- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] All routes load correctly
- [ ] Authentication flow works (login/logout/signup)
- [ ] CRUD operations work (Items, Users)
- [ ] Theme switching works
- [ ] No console errors in browser
- [ ] TypeScript shows no errors in IDE

---

## Rollback Strategy

Each phase can be rolled back independently:

1. **Git branches**: Create a branch for each phase (`migrate/phase-1`, etc.)
2. **Feature flags**: Not required for this migration (structural only)
3. **Incremental commits**: Commit after each step within a phase

```bash
# Before starting each phase
git checkout -b migrate/phase-N
git checkout main

# If rollback needed
git checkout main
git branch -D migrate/phase-N
```

---

## Timeline Estimate

| Phase | Description | Risk | Complexity |
|-------|-------------|------|------------|
| 1 | Foundation | Low | Simple |
| 2 | API Layer | Medium | Moderate |
| 3 | Providers | Low | Simple |
| 4 | Components | High | Complex |
| 5 | Types & Hooks | Low | Simple |
| 6 | Path Aliases | Low | Simple |

---

## Post-Migration Maintenance

### Coding Standards

After migration, enforce these standards:

1. **File naming**: Always kebab-case (`user-profile.tsx`)
2. **Folder naming**: Always kebab-case (`user-settings/`)
3. **Barrel exports**: Every folder with 2+ exports gets an `index.ts`
4. **Query keys**: Always use `queryKeys` factory from `@/api/keys`
5. **Imports**: Prefer barrel imports (`@/hooks` over `@/hooks/use-auth`)

### ESLint Rules (Recommended)

```json
{
  "rules": {
    "import/no-internal-modules": ["error", {
      "allow": ["@/components/ui/*"]
    }]
  }
}
```

---

## Appendix: File Mapping Reference

### Components

| Current Path | New Path |
|--------------|----------|
| `components/Admin/AddUser.tsx` | `components/features/admin/add-user.tsx` |
| `components/Admin/EditUser.tsx` | `components/features/admin/edit-user.tsx` |
| `components/Admin/DeleteUser.tsx` | `components/features/admin/delete-user.tsx` |
| `components/Admin/UserActionsMenu.tsx` | `components/features/admin/user-actions-menu.tsx` |
| `components/Admin/columns.tsx` | `components/features/admin/columns.tsx` |
| `components/Items/AddItem.tsx` | `components/features/items/add-item.tsx` |
| `components/Items/EditItem.tsx` | `components/features/items/edit-item.tsx` |
| `components/Items/DeleteItem.tsx` | `components/features/items/delete-item.tsx` |
| `components/Items/ItemActionsMenu.tsx` | `components/features/items/item-actions-menu.tsx` |
| `components/Items/columns.tsx` | `components/features/items/columns.tsx` |
| `components/UserSettings/ChangePassword.tsx` | `components/features/settings/change-password.tsx` |
| `components/UserSettings/DeleteAccount.tsx` | `components/features/settings/delete-account.tsx` |
| `components/UserSettings/DeleteConfirmation.tsx` | `components/features/settings/delete-confirmation.tsx` |
| `components/UserSettings/UserInformation.tsx` | `components/features/settings/user-information.tsx` |
| `components/Common/DataTable.tsx` | `components/common/data-table.tsx` |
| `components/Common/ErrorComponent.tsx` | `components/common/error-component.tsx` |
| `components/Common/NotFound.tsx` | `components/common/not-found.tsx` |
| `components/Common/Appearance.tsx` | `components/common/appearance.tsx` |
| `components/Common/AuthLayout.tsx` | `components/layout/auth-layout.tsx` |
| `components/Common/Footer.tsx` | `components/layout/footer.tsx` |
| `components/Common/Logo.tsx` | `components/common/logo.tsx` |
| `components/Sidebar/AppSidebar.tsx` | `components/layout/app-sidebar.tsx` |
| `components/Sidebar/Main.tsx` | `components/layout/sidebar-main.tsx` |
| `components/Sidebar/User.tsx` | `components/layout/sidebar-user.tsx` |
| `components/Pending/PendingItems.tsx` | `components/features/items/pending-items.tsx` |
| `components/Pending/PendingUsers.tsx` | `components/features/admin/pending-users.tsx` |
| `components/theme-provider.tsx` | `providers/theme-provider.tsx` |

### Hooks

| Current Path | New Path |
|--------------|----------|
| `hooks/useAuth.ts` | `hooks/use-auth.ts` |
| `hooks/useMobile.ts` | `hooks/use-mobile.ts` |
| `hooks/useCopyToClipboard.ts` | `hooks/use-copy-to-clipboard.ts` |
| `hooks/useCustomToast.ts` | `hooks/use-custom-toast.ts` |

### Utils

| Current Path | New Path |
|--------------|----------|
| `utils.ts` (handleError) | `utils/error-handling.ts` |
| `utils.ts` (getInitials) | `utils/string.ts` |
| `lib/utils.ts` (cn) | `lib/utils.ts` (unchanged) |
