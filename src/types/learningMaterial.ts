export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  contentUrl: string;
  typeId: string;
  typeName: string;
  subjectId: string;
  subjectName: string;
  authorId: string;
  authorName: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  fileImage?: string;
  uploader?: string;
}
export interface LearningMaterialQuery {
  pageNo?: number;
  pageSize?: number;
  keyword?: string;
  sorts?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageInfo<T> {
  pageNo: number;
  pageSize: number;
  totalPage: number;
  totalElement: number;
  totalElements?: number;
  items: T[];
  content?: T[];
  sortBy: string[];
}
