import type { ReactNode } from "react";


export interface StudentLayoutProps {
  children: ReactNode;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string; 
  parentName?: string; 
  coursesEnrolled?: string[]; 
  progress?: number; 
  status?: "active" | "inactive" | "graduated" | "pending"; 

    // Gợi ý thêm cho LMS
  dateOfBirth?: string; 
  address?: string; 
  enrollmentDate?: string; 
  gpa?: number; 
  notes?: string; 
}
