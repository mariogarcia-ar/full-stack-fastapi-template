import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ItemCreate, ItemUpdate } from "@/client"
import { ItemsService } from "@/client"
import { queryKeys } from "../keys"

export const useCreateItemMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ItemCreate) =>
      ItemsService.createItem({ requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all })
    },
  })
}

export const useUpdateItemMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemUpdate }) =>
      ItemsService.updateItem({ id, requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all })
    },
  })
}

export const useDeleteItemMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ItemsService.deleteItem({ id }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all })
    },
  })
}
