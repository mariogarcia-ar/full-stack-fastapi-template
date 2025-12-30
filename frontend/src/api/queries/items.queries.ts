import { ItemsService } from "@/client"
import { queryKeys } from "../keys"

export const itemsQueryOptions = {
  list: (params = { skip: 0, limit: 100 }) => ({
    queryKey: queryKeys.items.list(params),
    queryFn: () => ItemsService.readItems(params),
  }),

  detail: (id: string) => ({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => ItemsService.readItem({ id }),
  }),
}
