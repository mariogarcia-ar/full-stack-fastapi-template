import { UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import { DeleteConfirmationDialog } from "@/components/common"
import { useCrudMutation } from "@/hooks"
import useAuth from "@/hooks/use-auth"

const DeleteConfirmation = () => {
  const { logout } = useAuth()

  const mutation = useCrudMutation<unknown, void>({
    mutationFn: () => UsersService.deleteUserMe(),
    queryKey: ["currentUser"],
    successMessage: "Your account has been successfully deleted",
    onSuccess: () => logout(),
  })

  return (
    <DeleteConfirmationDialog
      title="Confirmation Required"
      description={
        <>
          All your account data will be <strong>permanently deleted.</strong> If
          you are sure, please click <strong>"Confirm"</strong> to proceed. This
          action cannot be undone.
        </>
      }
      onConfirm={() => mutation.mutate(undefined as void)}
      isPending={mutation.isPending}
      submitLabel="Delete"
      trigger={
        <Button variant="destructive" className="mt-3">
          Delete Account
        </Button>
      }
    />
  )
}

export default DeleteConfirmation
