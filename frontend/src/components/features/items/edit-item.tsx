import { Pencil } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { type ItemPublic, ItemsService } from "@/client"
import { EntityFormDialog, TextField } from "@/components/common"
import { useCrudMutation } from "@/hooks"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditItemProps {
  item: ItemPublic
  onSuccess: () => void
}

const EditItem = ({ item, onSuccess }: EditItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const mutation = useCrudMutation<unknown, FormData>({
    mutationFn: (data) => ItemsService.updateItem({ id: item.id, requestBody: data }),
    queryKey: ["items"],
    successMessage: "Item updated successfully",
    onSuccess: () => {
      setIsOpen(false)
      onSuccess()
    },
  })

  return (
    <EntityFormDialog
      mode="edit"
      title="Edit Item"
      description="Update the item details below."
      schema={formSchema}
      defaultValues={{
        title: item.title,
        description: item.description ?? "",
      }}
      onSubmit={(data: FormData) => mutation.mutate(data)}
      isPending={mutation.isPending}
      open={isOpen}
      onOpenChange={setIsOpen}
      isDropdownItem
      triggerIcon={<Pencil />}
    >
      <TextField name="title" label="Title" required />
      <TextField name="description" label="Description" />
    </EntityFormDialog>
  )
}

export default EditItem
