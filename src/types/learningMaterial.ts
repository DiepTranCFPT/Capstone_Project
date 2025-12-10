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
  price?: number;
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

// Types for GET /learning-materials/teacher/materials-with-students API
export interface RegisteredStudentTeacherProfile {
  id: string;
  qualification: string;
  specialization: string;
  experience: string;
  biography: string;
  rating: number;
  certificateUrls: string[];
  isVerified: boolean;
}

export interface RegisteredStudentStudentProfile {
  id: string;
  schoolName: string;
  emergencyContact: string;
  goal: string;
}

export interface RegisteredStudentParentProfile {
  id: string;
  occupation: string;
}

export interface RegisteredStudent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imgUrl: string;
  dob: string;
  roles: string[];
  teacherProfile?: RegisteredStudentTeacherProfile;
  studentProfile?: RegisteredStudentStudentProfile;
  parentProfile?: RegisteredStudentParentProfile;
}

export interface MaterialWithStudents {
  material: LearningMaterial;
  registeredStudents: RegisteredStudent[];
  totalStudent: number;
}

export interface MaterialsWithStudentsResponse {
  code: number;
  message: string;
  data: MaterialWithStudents[];
}
