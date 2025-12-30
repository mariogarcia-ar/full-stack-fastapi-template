# Frontend Legacy Compatibility Report

> **Generated**: 2025-12-29
> **Migration Reference**: `docs/frontend-folder-structure-migration.md`
> **Status**: Migration Complete

---

## Executive Summary

This document provides a comprehensive mapping of legacy paths to their new locations following the frontend folder structure migration. Use this as a reference when updating existing code, reviewing PRs, or onboarding new developers.

---

## Quick Reference: Import Changes

### Before vs After

```typescript
// ❌ LEGACY (no longer valid)
import { DataTable } from "@/components/Common/DataTable"
import AddUser from "@/components/Admin/AddUser"
import useAuth from "@/hooks/useAuth"
import { handleError } from "@/utils"

// ✅ NEW (current)
import { DataTable } from "@/components/common"
import { AddUser } from "@/components/features/admin"
import useAuth from "@/hooks/use-auth"
import { handleError } from "@/utils"
```

---

## File Path Mappings

### Components - Common

| Legacy Path | New Path | Export Type |
|-------------|----------|-------------|
| `@/components/Common/DataTable` | `@/components/common` → `DataTable` | Named |
| `@/components/Common/ErrorComponent` | `@/components/common` → `ErrorComponent` | Named |
| `@/components/Common/NotFound` | `@/components/common` → `NotFound` | Named |
| `@/components/Common/Logo` | `@/components/common` → `Logo` | Named |
| `@/components/Common/Appearance` | `@/components/common` → `Appearance`, `SidebarAppearance` | Named |
| `@/components/Common/AuthLayout` | `@/components/layout` → `AuthLayout` | Named |
| `@/components/Common/Footer` | `@/components/layout` → `Footer` | Named |

### Components - Layout (formerly Sidebar)

| Legacy Path | New Path | Export Type |
|-------------|----------|-------------|
| `@/components/Sidebar/AppSidebar` | `@/components/layout` → `AppSidebar` | Named |
| `@/components/Sidebar/Main` | `@/components/layout` → `SidebarMain` | Named |
| `@/components/Sidebar/User` | `@/components/layout` → `SidebarUser` | Named |

### Components - Features/Admin

| Legacy Path | New Path | Export Type |
|-------------|----------|-------------|
| `@/components/Admin/AddUser` | `@/components/features/admin` → `AddUser` | Named |
| `@/components/Admin/EditUser` | `@/components/features/admin` → `EditUser` | Named |
| `@/components/Admin/DeleteUser` | `@/components/features/admin` → `DeleteUser` | Named |
| `@/components/Admin/UserActionsMenu` | `@/components/features/admin` → `UserActionsMenu` | Named |
| `@/components/Admin/columns` | `@/components/features/admin` → `columns`, `UserTableData` | Named |
| `@/components/Pending/PendingUsers` | `@/components/features/admin` → `PendingUsers` | Named |

### Components - Features/Items

| Legacy Path | New Path | Export Type |
|-------------|----------|-------------|
| `@/components/Items/AddItem` | `@/components/features/items` → `AddItem` | Named |
| `@/components/Items/EditItem` | `@/components/features/items` → `EditItem` | Named |
| `@/components/Items/DeleteItem` | `@/components/features/items` → `DeleteItem` | Named |
| `@/components/Items/ItemActionsMenu` | `@/components/features/items` → `ItemActionsMenu` | Named |
| `@/components/Items/columns` | `@/components/features/items` → `columns` | Named |
| `@/components/Pending/PendingItems` | `@/components/features/items` → `PendingItems` | Named |

### Components - Features/Settings

| Legacy Path | New Path | Export Type |
|-------------|----------|-------------|
| `@/components/UserSettings/ChangePassword` | `@/components/features/settings` → `ChangePassword` | Named |
| `@/components/UserSettings/DeleteAccount` | `@/components/features/settings` → `DeleteAccount` | Named |
| `@/components/UserSettings/DeleteConfirmation` | `@/components/features/settings` → `DeleteConfirmation` | Named |
| `@/components/UserSettings/UserInformation` | `@/components/features/settings` → `UserInformation` | Named |

### Components - Providers

| Legacy Path | New Path | Export Type |
|-------------|----------|-------------|
| `@/components/theme-provider` | `@/providers` → `ThemeProvider`, `useTheme`, `Theme` | Named |

### Hooks

| Legacy Path | New Path | Export Type |
|-------------|----------|-------------|
| `@/hooks/useAuth` | `@/hooks/use-auth` | Default + Named (`isLoggedIn`) |
| `@/hooks/useMobile` | `@/hooks/use-mobile` → `useIsMobile` | Named |
| `@/hooks/useCopyToClipboard` | `@/hooks/use-copy-to-clipboard` | Named |
| `@/hooks/useCustomToast` | `@/hooks/use-custom-toast` | Default |

### Utilities

| Legacy Path | New Path | Export |
|-------------|----------|--------|
| `@/utils` (root file) | `@/utils` (barrel export) | `handleError`, `getInitials` |
| `@/lib/utils` | `@/lib/utils` | `cn` (unchanged) |

---

## Deleted Files & Folders

The following paths no longer exist:

```
src/
├── components/
│   ├── Admin/              # → Moved to features/admin/
│   ├── Common/             # → Split to common/ and layout/
│   ├── Items/              # → Moved to features/items/
│   ├── Pending/            # → Merged into features/
│   ├── Sidebar/            # → Moved to layout/
│   ├── UserSettings/       # → Moved to features/settings/
│   └── theme-provider.tsx  # → Moved to providers/
└── utils.ts                # → Moved to utils/
```

---

## New Folders Created

| Folder | Purpose |
|--------|---------|
| `src/api/` | Centralized API layer |
| `src/api/queries/` | React Query query options |
| `src/api/mutations/` | React Query mutation hooks |
| `src/config/` | Application configuration constants |
| `src/providers/` | React context providers |
| `src/types/` | Shared TypeScript types |
| `src/utils/` | Utility functions (refactored from root) |
| `src/components/common/` | Shared UI components |
| `src/components/layout/` | Layout components |
| `src/components/features/` | Feature-based component organization |

---

## API Layer (New)

### Query Options

Replace inline query definitions with centralized options:

```typescript
// ❌ LEGACY
function getItemsQueryOptions() {
  return {
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 100 }),
    queryKey: ["items"],
  }
}
const { data } = useSuspenseQuery(getItemsQueryOptions())

// ✅ NEW
import { itemsQueryOptions } from "@/api/queries"
const { data } = useSuspenseQuery(itemsQueryOptions.list())
```

### Available Query Options

| Import | Methods |
|--------|---------|
| `itemsQueryOptions` | `.list(params?)`, `.detail(id)` |
| `usersQueryOptions` | `.current()`, `.list(params?)`, `.detail(userId)` |

### Query Keys

Use the centralized query key factory:

```typescript
// ❌ LEGACY
queryClient.invalidateQueries({ queryKey: ["items"] })
queryClient.invalidateQueries({ queryKey: ["users"] })
queryClient.invalidateQueries({ queryKey: ["currentUser"] })

// ✅ NEW
import { queryKeys } from "@/api/keys"
queryClient.invalidateQueries({ queryKey: queryKeys.items.all })
queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
queryClient.invalidateQueries({ queryKey: queryKeys.users.current() })
```

### Mutation Hooks (Available but Optional)

New mutation hooks are available in `@/api/mutations/`:

```typescript
import { useCreateItemMutation, useDeleteItemMutation } from "@/api/mutations"

// Usage
const createMutation = useCreateItemMutation({
  onSuccess: () => { /* ... */ },
  onError: handleError.bind(showErrorToast),
})
```

---

## Configuration (New)

### Constants

```typescript
// ❌ LEGACY - hardcoded values
localStorage.getItem("access_token")
{ skip: 0, limit: 100 }

// ✅ NEW - centralized config
import { AUTH, DEFAULT_PAGE_SIZE } from "@/config"
localStorage.getItem(AUTH.TOKEN_KEY)
{ skip: 0, limit: DEFAULT_PAGE_SIZE }
```

### Route Constants

```typescript
// ❌ LEGACY - hardcoded strings
navigate({ to: "/login" })
navigate({ to: "/" })

// ✅ NEW - centralized routes
import { ROUTES } from "@/config"
navigate({ to: ROUTES.LOGIN })
navigate({ to: ROUTES.HOME })
```

---

## Naming Convention Changes

### Folders

| Convention | Legacy | New |
|------------|--------|-----|
| Component folders | PascalCase (`Admin/`) | kebab-case (`admin/`) |
| Feature folders | PascalCase (`UserSettings/`) | kebab-case (`settings/`) |

### Files

| Convention | Legacy | New |
|------------|--------|-----|
| Components | PascalCase (`AddUser.tsx`) | kebab-case (`add-user.tsx`) |
| Hooks | camelCase (`useAuth.ts`) | kebab-case (`use-auth.ts`) |
| Utilities | camelCase (`utils.ts`) | kebab-case (`error-handling.ts`) |

### Exports

| Convention | Legacy | New |
|------------|--------|-----|
| Components | Mixed (default/named) | Prefer named exports via barrel |
| Hooks | Default export | Default export (unchanged) |

---

## Path Aliases

### tsconfig.json

New aliases added:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/api": ["./src/api/index.ts"],
    "@/api/*": ["./src/api/*"],
    "@/common": ["./src/components/common/index.ts"],
    "@/features/*": ["./src/components/features/*"],
    "@/layout": ["./src/components/layout/index.ts"],
    "@/config": ["./src/config/index.ts"],
    "@/hooks": ["./src/hooks/index.ts"],
    "@/providers": ["./src/providers/index.ts"],
    "@/types": ["./src/types/index.ts"],
    "@/utils": ["./src/utils/index.ts"]
  }
}
```

### vite.config.ts

Matching aliases added for build resolution.

---

## Deprecated Patterns

### 1. Inline Query Definitions in Routes

```typescript
// ❌ DEPRECATED
function getItemsQueryOptions() {
  return {
    queryFn: () => ItemsService.readItems({ skip: 0, limit: 100 }),
    queryKey: ["items"],
  }
}

// ✅ USE INSTEAD
import { itemsQueryOptions } from "@/api/queries"
```

### 2. String-based Query Keys

```typescript
// ❌ DEPRECATED
queryClient.invalidateQueries({ queryKey: ["items"] })

// ✅ USE INSTEAD
import { queryKeys } from "@/api/keys"
queryClient.invalidateQueries({ queryKey: queryKeys.items.all })
```

### 3. Deep Component Imports

```typescript
// ❌ DEPRECATED
import AddUser from "@/components/Admin/AddUser"
import DeleteUser from "@/components/Admin/DeleteUser"

// ✅ USE INSTEAD
import { AddUser, DeleteUser } from "@/components/features/admin"
```

### 4. Theme Provider from Components

```typescript
// ❌ DEPRECATED
import { ThemeProvider, useTheme } from "@/components/theme-provider"

// ✅ USE INSTEAD
import { ThemeProvider, useTheme } from "@/providers"
```

---

## Migration Checklist for New Code

When writing new code, ensure:

- [ ] Components go in appropriate `features/` subfolder
- [ ] Use kebab-case for all new files and folders
- [ ] Import from barrel exports, not direct paths
- [ ] Use `queryKeys` factory for query keys
- [ ] Use `itemsQueryOptions`/`usersQueryOptions` for queries
- [ ] Use constants from `@/config` for magic values
- [ ] Add new types to `@/types/` if shared

---

## Search & Replace Patterns

For any remaining legacy imports, use these patterns:

```bash
# Components
s|@/components/Common/|@/components/common/|g
s|@/components/Admin/|@/components/features/admin/|g
s|@/components/Items/|@/components/features/items/|g
s|@/components/UserSettings/|@/components/features/settings/|g
s|@/components/Sidebar/|@/components/layout/|g
s|@/components/Pending/PendingUsers|@/components/features/admin|g
s|@/components/Pending/PendingItems|@/components/features/items|g

# Hooks
s|@/hooks/useAuth|@/hooks/use-auth|g
s|@/hooks/useMobile|@/hooks/use-mobile|g
s|@/hooks/useCopyToClipboard|@/hooks/use-copy-to-clipboard|g
s|@/hooks/useCustomToast|@/hooks/use-custom-toast|g

# Providers
s|@/components/theme-provider|@/providers|g
```

---

## Component Rename Reference

### Layout Components

| Old Name | New Name | Location |
|----------|----------|----------|
| `Main` | `SidebarMain` | `@/components/layout` |
| `User` | `SidebarUser` | `@/components/layout` |
| `AppSidebar` | `AppSidebar` | `@/components/layout` |

### Hook Exports

| Old Export | New Export | Location |
|------------|------------|----------|
| `useMobile` | `useIsMobile` | `@/hooks/use-mobile` |

---

## Testing Considerations

After migration, verify:

1. **Build passes**: `npm run build`
2. **Type checking**: `npx tsc --noEmit`
3. **All routes load**: Manual verification
4. **Auth flow works**: Login/logout/signup
5. **CRUD operations**: Items and Users
6. **Theme switching**: Light/dark/system

---

## Rollback Instructions

If rollback is needed, restore from git:

```bash
# View changes
git diff HEAD~1 --stat

# Full rollback
git checkout HEAD~1 -- frontend/src/

# Selective rollback (specific folder)
git checkout HEAD~1 -- frontend/src/components/
```

---

## Contact

For questions about this migration, refer to:
- Migration plan: `docs/frontend-folder-structure-migration.md`
- This report: `docs/frontend-legacy-compatibility-report.md`
