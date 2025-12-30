import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

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

export interface DeleteConfirmationDialogProps {
  title: string
  description: React.ReactNode
  onConfirm: () => Promise<void> | void
  isPending: boolean
  trigger?: React.ReactNode
  isDropdownItem?: boolean
  variant?: "destructive" | "warning"
  submitLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteConfirmationDialog({
  title,
  description,
  onConfirm,
  isPending,
  trigger,
  isDropdownItem = false,
  variant = "destructive",
  submitLabel = "Delete",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DeleteConfirmationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { handleSubmit } = useForm()

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  const onSubmit = async () => {
    await onConfirm()
  }

  const defaultTrigger = (
    <Button variant={variant === "warning" ? "outline" : "destructive"}>
      <Trash2 className="mr-2 h-4 w-4" />
      {submitLabel}
    </Button>
  )

  const dropdownTrigger = (
    <DropdownMenuItem
      variant="destructive"
      onSelect={(e) => e.preventDefault()}
      onClick={() => setOpen(true)}
    >
      <Trash2 />
      {submitLabel}
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <DialogFooterActions
            isPending={isPending}
            submitLabel={submitLabel}
            variant={variant === "warning" ? "default" : "destructive"}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
