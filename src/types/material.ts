export interface Material {
  id: number;
  title: string;
  topic: string;
  subject: string;
  free: boolean;
  price: number;
  students: number;
  lessons: number;
  views: string;
  image: string;
  description: string;
    category?: string;
}
