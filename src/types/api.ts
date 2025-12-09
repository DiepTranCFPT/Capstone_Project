
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageable?: {
    pageNumber: number;
    pageSize?: number;
    offset?: number;
    paged?: boolean;
    unpaged?: boolean;
  };
  last?: boolean;
  first?: boolean;
  number?: number;
  size?: number;
  numberOfElements?: number;
  empty?: boolean;
}