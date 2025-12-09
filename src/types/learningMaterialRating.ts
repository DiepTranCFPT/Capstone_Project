export interface LearningMaterialRating {
  id: string;
  learningMaterialId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  studentId?: string;
}

export interface LearningMaterialRatingSummary {
  averageRating: number;
  totalRatings: number;
  ratings: LearningMaterialRating[];
}

export interface CreateLearningMaterialRatingPayload {
  learningMaterialId: string;
  rating: number;
  comment?: string;
  studentId?: string;
}

export interface LearningMaterialRatingPayload {
  learningMaterialId: string;
  studentId: string;
  rating: number;
  comment?: string;
}

export interface LearningMaterialRatingStatistics {
  averageRating: number;
  totalRatings: number;
  distribution?: Record<number, number>;
}

