import { Plus } from "lucide-react"
import { useState } from "react"
import { z } from "zod"

import { type ItemCreate, ItemsService } from "@/client"
import { Button } from "@/components/ui/button"
import { EntityFormDialog, TextField } from "@/components/common"
import { useCrudMutation } from "@/hooks"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const AddItem = () => {
  const [isOpen, setIsOpen] = useState(false)

  const mutation = useCrudMutation<unknown, ItemCreate>({
    mutationFn: (data) => ItemsService.createItem({ requestBody: data }),
    queryKey: ["items"],
    successMessage: "Item created successfully",
    onSuccess: () => setIsOpen(false),
  })

  return (
    <EntityFormDialog
      mode="add"
      title="Add Item"
      description="Fill in the details to add a new item."
      schema={formSchema}
      defaultValues={{ title: "", description: "" }}
      onSubmit={(data: FormData) => mutation.mutate(data)}
      isPending={mutation.isPending}
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Item
        </Button>
      }
    >
      <TextField name="title" label="Title" required />
      <TextField name="description" label="Description" />
    </EntityFormDialog>
  )
}

export default AddItem
