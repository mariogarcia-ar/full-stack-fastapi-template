import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { Body_login_login_access_token, UserRegister, NewPassword } from "@/client"
import { LoginService, UsersService } from "@/client"
import { AUTH, ROUTES } from "@/config"
import { queryKeys } from "../keys"

export const useLoginMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: Body_login_login_access_token) => {
      const response = await LoginService.loginAccessToken({ formData: data })
      localStorage.setItem(AUTH.TOKEN_KEY, response.access_token)
      return response
    },
    onSuccess: () => {
      options?.onSuccess?.()
      navigate({ to: ROUTES.HOME })
    },
    onError: options?.onError,
  })
}

export const useSignUpMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      options?.onSuccess?.()
      navigate({ to: ROUTES.LOGIN })
    },
    onError: options?.onError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
    },
  })
}

export const useRecoverPasswordMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  return useMutation({
    mutationFn: (email: string) => LoginService.recoverPassword({ email }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

export const useResetPasswordMutation = (options?: {
  onSuccess?: () => void
  onError?: (err: unknown) => void
}) => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: NewPassword) =>
      LoginService.resetPassword({ requestBody: data }),
    onSuccess: () => {
      options?.onSuccess?.()
      navigate({ to: ROUTES.LOGIN })
    },
    onError: options?.onError,
  })
}

export const useLogout = () => {
  const navigate = useNavigate()

  return () => {
    localStorage.removeItem(AUTH.TOKEN_KEY)
    navigate({ to: ROUTES.LOGIN })
  }
}
