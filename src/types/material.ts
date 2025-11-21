export interface Material {
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
  topic?: string;
  subject?: string;
  free?: boolean;
  price?: number;
  students?: number;
  lessons?: number;
  views?: string;
  image?: string;
  thumbnail?: string;
  fileImage?: string;
  category?: string;
}

export interface MaterialResponse {
  code: number;
  message: string;
  data: {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElement: number;
    sortBy: string[];
    items: Material[];
  };
}
