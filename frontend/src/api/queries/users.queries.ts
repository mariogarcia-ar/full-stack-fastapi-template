import { UsersService } from "@/client"
import { queryKeys } from "../keys"

export const usersQueryOptions = {
  current: () => ({
    queryKey: queryKeys.users.current(),
    queryFn: UsersService.readUserMe,
  }),

  list: (params = { skip: 0, limit: 100 }) => ({
    queryKey: queryKeys.users.list(params),
    queryFn: () => UsersService.readUsers(params),
  }),

  detail: (userId: string) => ({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => UsersService.readUserById({ userId }),
  }),
}
