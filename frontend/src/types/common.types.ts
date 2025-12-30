export interface PaginationParams {
  skip?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
}
