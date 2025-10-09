
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imgUrl?: string;
  dob?: string; 
  roles: string[];
  active: boolean;
}

export interface UserPaginationData {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  sortBy: string[];
  items: User[];
}

export interface UserResponse {
  code: number;
  message: string;
  data: UserPaginationData;
}


export interface UserQueryParams {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
