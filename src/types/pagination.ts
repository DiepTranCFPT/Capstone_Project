export interface PageInfo<T> {
  items?: T[];            
  content?: T[];          
  totalElements?: number; 
  totalElement?: number;  
  pageNo?: number;        
  pageSize?: number;     
}