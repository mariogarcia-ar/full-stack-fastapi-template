import { useState } from "react"

import { UsersService } from "@/client"
import { DeleteConfirmationDialog } from "@/components/common"
import { useCrudMutation } from "@/hooks"

interface DeleteUserProps {
  id: string
  onSuccess: () => void
}

const DeleteUser = ({ id, onSuccess }: DeleteUserProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const mutation = useCrudMutation<unknown, string>({
    mutationFn: (userId) => UsersService.deleteUser({ userId }),
    queryKey: ["users"],
    successMessage: "The user was deleted successfully",
    onSuccess: () => {
      setIsOpen(false)
      onSuccess()
    },
    invalidateAll: true,
  })

  return (
    <DeleteConfirmationDialog
      title="Delete User"
      description={
        <>
          All items associated with this user will also be{" "}
          <strong>permanently deleted.</strong> Are you sure? You will not be
          able to undo this action.
        </>
      }
      onConfirm={() => mutation.mutate(id)}
      isPending={mutation.isPending}
      isDropdownItem
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  )
}

export default DeleteUser
