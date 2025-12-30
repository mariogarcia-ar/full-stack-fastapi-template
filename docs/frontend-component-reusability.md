# Frontend Component Reusability Recommendations

> Analysis Date: 2025-12-29
> Status: Implementation In Progress

## Executive Summary

Analysis of the frontend codebase revealed significant code duplication across CRUD dialog components. This document outlines patterns detected, issues identified, and implemented solutions to improve component reusability.

---

## Current Patterns Detected

### Good Practices Already in Place

1. **shadcn/ui + CVA**: Proper variant-based styling using class-variance-authority
2. **TanStack Query**: Clean separation of queries/mutations in `/api` layer
3. **Zod + React Hook Form**: Type-safe form validation
4. **Feature-based structure**: `components/features/{domain}/` organization
5. **Barrel exports**: Index files for clean imports

---

## Issues Identified

### Major Code Duplication

| Pattern | Files | Duplication |
|---------|-------|-------------|
| Add Entity Dialog | `add-user.tsx`, `add-item.tsx` | ~80% identical |
| Edit Entity Dialog | `edit-user.tsx`, `edit-item.tsx` | ~85% identical |
| Delete Confirmation | `delete-user.tsx`, `delete-item.tsx`, `delete-confirmation.tsx` | ~90% identical |
| Mutation Boilerplate | Every feature component | 100% repeated |
| Button Variants | `button.tsx`, `loading-button.tsx` | 100% duplicated |

---

## Implemented Solutions

### 1. Fixed `buttonVariants` Duplication

**File**: `src/components/ui/loading-button.tsx`

**Problem**: `buttonVariants` was defined identically in both `button.tsx` and `loading-button.tsx`.

**Solution**: Import `buttonVariants` from `button.tsx` instead of redefining.

---

### 2. Created `useCrudMutation` Hook

**File**: `src/hooks/use-crud-mutation.ts`

**Purpose**: Encapsulates the common mutation pattern with toast notifications and query invalidation.

**Usage**:
```tsx
const mutation = useCrudMutation({
  mutationFn: (data) => Service.create({ requestBody: data }),
  queryKey: ["items"],
  successMessage: "Item created successfully",
  onSuccess: () => setIsOpen(false),
})
```

**Benefits**:
- Eliminates 10-15 lines of boilerplate per component
- Consistent error handling via `handleError`
- Automatic query invalidation
- Type-safe with generics

---

### 3. Created `DeleteConfirmationDialog` Component

**File**: `src/components/common/delete-confirmation-dialog.tsx`

**Purpose**: Reusable confirmation dialog for destructive actions.

**Usage**:
```tsx
<DeleteConfirmationDialog
  title="Delete Item"
  description="This item will be permanently deleted."
  onConfirm={() => deleteItem(id)}
  isPending={mutation.isPending}
  trigger={<Button variant="destructive">Delete</Button>}
/>
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Dialog title |
| `description` | `ReactNode` | Confirmation message |
| `onConfirm` | `() => Promise<void>` | Action to execute |
| `isPending` | `boolean` | Loading state |
| `trigger` | `ReactNode` | Optional custom trigger |
| `isDropdownItem` | `boolean` | Render as dropdown menu item |
| `variant` | `"destructive" \| "warning"` | Button variant |

---

### 4. Created `DialogFooterActions` Component

**File**: `src/components/common/dialog-footer-actions.tsx`

**Purpose**: Standardized dialog footer with Cancel/Submit buttons.

**Usage**:
```tsx
<DialogFooterActions
  isPending={mutation.isPending}
  submitLabel="Save"
  variant="default"
/>
```

---

### 5. Created Reusable Form Field Components

**Directory**: `src/components/common/form-fields/`

**Components**:
- `TextField` - Text/email input with label
- `PasswordField` - Password input with visibility toggle
- `CheckboxField` - Checkbox with label
- `TextareaField` - Multiline text input

**Usage**:
```tsx
<TextField name="email" label="Email" required placeholder="Enter email" />
<PasswordField name="password" label="Password" required />
<CheckboxField name="is_active" label="Is active?" />
```

**Benefits**:
- Reduces 10-15 lines per field to 1 line
- Consistent styling and error handling
- Automatic integration with React Hook Form

---

### 6. Created `EntityFormDialog` Component

**File**: `src/components/common/entity-form-dialog.tsx`

**Purpose**: Generic dialog for Add/Edit entity operations.

**Usage**:
```tsx
<EntityFormDialog
  mode="add"
  title="Add Item"
  description="Fill in the details to add a new item."
  schema={itemSchema}
  defaultValues={{ title: "", description: "" }}
  onSubmit={(data) => mutation.mutate(data)}
  isPending={mutation.isPending}
  trigger={<Button><Plus /> Add Item</Button>}
>
  <TextField name="title" label="Title" required />
  <TextField name="description" label="Description" />
</EntityFormDialog>
```

**Benefits**:
- Single component handles both Add and Edit modes
- Schema-driven validation
- Flexible field composition via children
- Consistent dialog structure

---

## Migration Guide

### Before (Old Pattern)
```tsx
// 239 lines in add-user.tsx
const AddUser = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm({ ... })

  const mutation = useMutation({
    mutationFn: ...,
    onSuccess: () => { ... },
    onError: handleError.bind(showErrorToast),
    onSettled: () => { queryClient.invalidateQueries(...) },
  })

  return (
    <Dialog>
      <DialogTrigger>...</DialogTrigger>
      <DialogContent>
        <Form>
          <form>
            <FormField>...</FormField>
            <FormField>...</FormField>
            {/* 150+ lines of form fields */}
            <DialogFooter>...</DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### After (New Pattern)
```tsx
// ~50 lines
const AddUser = () => {
  const [isOpen, setIsOpen] = useState(false)

  const mutation = useCrudMutation({
    mutationFn: (data: UserCreate) => UsersService.createUser({ requestBody: data }),
    queryKey: ["users"],
    successMessage: "User created successfully",
    onSuccess: () => setIsOpen(false),
  })

  return (
    <EntityFormDialog
      mode="add"
      title="Add User"
      description="Fill in the form below to add a new user."
      schema={userSchema}
      defaultValues={defaultValues}
      onSubmit={(data) => mutation.mutate(data)}
      isPending={mutation.isPending}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={<Button><Plus /> Add User</Button>}
    >
      <TextField name="email" label="Email" type="email" required />
      <TextField name="full_name" label="Full Name" />
      <PasswordField name="password" label="Password" required />
      <PasswordField name="confirm_password" label="Confirm Password" required />
      <CheckboxField name="is_superuser" label="Is superuser?" />
      <CheckboxField name="is_active" label="Is active?" />
    </EntityFormDialog>
  )
}
```

---

## File Structure After Implementation

```
src/
├── components/
│   ├── common/
│   │   ├── data-table.tsx
│   │   ├── delete-confirmation-dialog.tsx  # NEW
│   │   ├── dialog-footer-actions.tsx       # NEW
│   │   ├── entity-form-dialog.tsx          # NEW
│   │   ├── form-fields/                    # NEW
│   │   │   ├── index.ts
│   │   │   ├── text-field.tsx
│   │   │   ├── password-field.tsx
│   │   │   ├── checkbox-field.tsx
│   │   │   └── textarea-field.tsx
│   │   └── index.ts
│   └── ui/
│       ├── button.tsx
│       └── loading-button.tsx              # UPDATED
├── hooks/
│   ├── use-crud-mutation.ts                # NEW
│   └── use-custom-toast.ts
```

---

## Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Add Entity LOC | ~150 | ~50 | -67% |
| Edit Entity LOC | ~170 | ~55 | -68% |
| Delete Confirm LOC | ~95 | ~20 | -79% |
| Total CRUD LOC (per entity) | ~415 | ~125 | -70% |

---

## Future Considerations

1. **Server Actions**: Consider migrating to React Server Components when applicable
2. **Form Builder**: Could extend to JSON-schema driven form generation
3. **Optimistic Updates**: Add optimistic mutation support to `useCrudMutation`
