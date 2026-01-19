export enum DifficultyLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  category: string | null;
  difficultyLevel: DifficultyLevel;
  createdBy: string;
  bannerUrl: string | null;
  redirectUrl: string | null;
  createdAt: string;
  updatedAt: string;
  creatorName: string | null;
  creatorAvatarUrl: string | null;
  creatorType: string | null;
}
