import { Pencil } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { type UserPublic, UsersService } from "@/client"
import {
  EntityFormDialog,
  TextField,
  PasswordField,
  CheckboxField,
} from "@/components/common"
import { useCrudMutation } from "@/hooks"

const formSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    full_name: z.string().optional(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .optional()
      .or(z.literal("")),
    confirm_password: z.string().optional(),
    is_superuser: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirm_password, {
    message: "The passwords don't match",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

interface EditUserProps {
  user: UserPublic
  onSuccess: () => void
}

const EditUser = ({ user, onSuccess }: EditUserProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const mutation = useCrudMutation<unknown, FormData>({
    mutationFn: (data) => {
      const { confirm_password: _, ...submitData } = data
      if (!submitData.password) {
        delete submitData.password
      }
      return UsersService.updateUser({ userId: user.id, requestBody: submitData })
    },
    queryKey: ["users"],
    successMessage: "User updated successfully",
    onSuccess: () => {
      setIsOpen(false)
      onSuccess()
    },
  })

  return (
    <EntityFormDialog
      mode="edit"
      title="Edit User"
      description="Update the user details below."
      schema={formSchema}
      defaultValues={{
        email: user.email,
        full_name: user.full_name ?? "",
        password: "",
        confirm_password: "",
        is_superuser: user.is_superuser,
        is_active: user.is_active,
      }}
      onSubmit={(data: FormData) => mutation.mutate(data)}
      isPending={mutation.isPending}
      open={isOpen}
      onOpenChange={setIsOpen}
      isDropdownItem
      triggerIcon={<Pencil />}
    >
      <TextField name="email" label="Email" type="email" required />
      <TextField name="full_name" label="Full Name" />
      <PasswordField name="password" label="Set Password" />
      <PasswordField name="confirm_password" label="Confirm Password" />
      <CheckboxField name="is_superuser" label="Is superuser?" />
      <CheckboxField name="is_active" label="Is active?" />
    </EntityFormDialog>
  )
}

export default EditUser
