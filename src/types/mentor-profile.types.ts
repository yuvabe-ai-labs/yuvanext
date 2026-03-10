export interface MentorProfileData {
  id?: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  image?: string;
  mentorType?: string;
  experienceSnapshot?: string;
  expertiseAreas?: string[];
  availabilityDays?: string[];
  availabilityTimeWindows?: { start: string; end: string }[]; // Or any[] depending on your schema
  mentoringCapacity?: number;
  communicationModes?: string[];
  socialLinks?: any; // Array of objects or Record<string, string>
  updatedAt?: string;
  profileScore?: number;
}

export type UpdateMentorProfilePayload = Partial<MentorProfileData>;