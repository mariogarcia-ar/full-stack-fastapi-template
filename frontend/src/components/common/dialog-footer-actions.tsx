import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { LoadingButton } from "@/components/ui/loading-button"

export interface DialogFooterActionsProps {
  isPending: boolean
  submitLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onCancel?: () => void
}

export function DialogFooterActions({
  isPending,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  variant = "default",
  onCancel,
}: DialogFooterActionsProps) {
  return (
    <DialogFooter className="mt-4">
      <DialogClose asChild>
        <Button variant="outline" disabled={isPending} onClick={onCancel}>
          {cancelLabel}
        </Button>
      </DialogClose>
      <LoadingButton
        type="submit"
        variant={variant}
        loading={isPending}
      >
        {submitLabel}
      </LoadingButton>
    </DialogFooter>
  )
}
