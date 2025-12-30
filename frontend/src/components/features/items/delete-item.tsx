import { useState } from "react"

import { ItemsService } from "@/client"
import { DeleteConfirmationDialog } from "@/components/common"
import { useCrudMutation } from "@/hooks"

interface DeleteItemProps {
  id: string
  onSuccess: () => void
}

const DeleteItem = ({ id, onSuccess }: DeleteItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const mutation = useCrudMutation<unknown, string>({
    mutationFn: (itemId) => ItemsService.deleteItem({ id: itemId }),
    queryKey: ["items"],
    successMessage: "The item was deleted successfully",
    onSuccess: () => {
      setIsOpen(false)
      onSuccess()
    },
    invalidateAll: true,
  })

  return (
    <DeleteConfirmationDialog
      title="Delete Item"
      description="This item will be permanently deleted. Are you sure? You will not be able to undo this action."
      onConfirm={() => mutation.mutate(id)}
      isPending={mutation.isPending}
      isDropdownItem
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  )
}

export default DeleteItem
