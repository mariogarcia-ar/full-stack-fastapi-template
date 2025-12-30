import { Plus } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { type UserCreate, UsersService } from "@/client"
import { Button } from "@/components/ui/button"
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
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z
      .string()
      .min(1, { message: "Please confirm your password" }),
    is_superuser: z.boolean(),
    is_active: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords don't match",
    path: ["confirm_password"],
  })

type FormData = z.infer<typeof formSchema>

const AddUser = () => {
  const [isOpen, setIsOpen] = useState(false)

  const mutation = useCrudMutation<unknown, UserCreate>({
    mutationFn: (data) => UsersService.createUser({ requestBody: data }),
    queryKey: ["users"],
    successMessage: "User created successfully",
    onSuccess: () => setIsOpen(false),
  })

  const handleSubmit = (data: FormData) => {
    const { confirm_password: _, ...submitData } = data
    mutation.mutate(submitData)
  }

  return (
    <EntityFormDialog
      mode="add"
      title="Add User"
      description="Fill in the form below to add a new user to the system."
      schema={formSchema}
      defaultValues={{
        email: "",
        full_name: "",
        password: "",
        confirm_password: "",
        is_superuser: false,
        is_active: false,
      }}
      onSubmit={handleSubmit}
      isPending={mutation.isPending}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="my-4">
          <Plus className="mr-2" />
          Add User
        </Button>
      }
    >
      <TextField name="email" label="Email" type="email" required />
      <TextField name="full_name" label="Full Name" />
      <PasswordField name="password" label="Set Password" required />
      <PasswordField name="confirm_password" label="Confirm Password" required />
      <CheckboxField name="is_superuser" label="Is superuser?" />
      <CheckboxField name="is_active" label="Is active?" />
    </EntityFormDialog>
  )
}

export default AddUser
