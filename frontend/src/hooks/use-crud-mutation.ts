import { useMutation, useQueryClient } from "@tanstack/react-query"
import useCustomToast from "./use-custom-toast"
import { handleError } from "@/utils"

export interface UseCrudMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKey: string[]
  successMessage: string
  onSuccess?: (data: TData) => void
  onError?: (error: unknown) => void
  invalidateAll?: boolean
}

export function useCrudMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  queryKey,
  successMessage,
  onSuccess,
  onError,
  invalidateAll = false,
}: UseCrudMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      showSuccessToast(successMessage)
      onSuccess?.(data)
    },
    onError: (error) => {
      handleError.call(showErrorToast, error as any)
      onError?.(error)
    },
    onSettled: () => {
      if (invalidateAll) {
        queryClient.invalidateQueries()
      } else {
        queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}
