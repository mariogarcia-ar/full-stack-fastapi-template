import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { UserCreate, UserUpdate, UserUpdateMe, UpdatePassword } from "@/client"
import { UsersService } from "@/client"
import { queryKeys } from "../keys"

export const useCreateUserMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserCreate) =>
      UsersService.createUser({ requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export const useUpdateUserMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdate }) =>
      UsersService.updateUser({ userId, requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export const useDeleteUserMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => UsersService.deleteUser({ userId }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export const useUpdateCurrentUserMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() })
    },
  })
}

export const useUpdatePasswordMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  return useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

export const useDeleteCurrentUserMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => UsersService.deleteUserMe(),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() })
    },
  })
}
