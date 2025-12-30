import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DialogFooterActions } from "./dialog-footer-actions"

type AnyZodObject = z.ZodType<Record<string, unknown>>

export interface EntityFormDialogProps<TSchema extends AnyZodObject> {
  mode: "add" | "edit"
  title: string
  description: string
  schema: TSchema
  defaultValues: z.infer<TSchema>
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>
  isPending: boolean
  trigger?: React.ReactNode
  triggerIcon?: React.ReactNode
  isDropdownItem?: boolean
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  submitLabel?: string
}

export function EntityFormDialog<TSchema extends AnyZodObject>({
  mode,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  isPending,
  trigger,
  triggerIcon,
  isDropdownItem = false,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  submitLabel = "Save",
}: EntityFormDialogProps<TSchema>) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: defaultValues as Record<string, unknown>,
  })

  const handleSubmit = async (data: Record<string, unknown>) => {
    await onSubmit(data as z.infer<TSchema>)
  }

  const defaultTrigger = (
    <Button>
      {triggerIcon}
      {mode === "add" ? `Add ${title.replace("Add ", "").replace("Edit ", "")}` : title}
    </Button>
  )

  const dropdownTrigger = (
    <DropdownMenuItem
      onSelect={(e) => e.preventDefault()}
      onClick={() => setOpen(true)}
    >
      {triggerIcon}
      {title}
    </DropdownMenuItem>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isDropdownItem && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      {isDropdownItem && dropdownTrigger}
      <DialogContent className="sm:max-w-md">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {children}
            </div>
            <DialogFooterActions
              isPending={isPending}
              submitLabel={submitLabel}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
