export type AISectionType =
  | "about"
  | "key_responsibilities"
  | "what_you_will_get"
  | "skills_required";

export interface GenerateContentPayload {
  title: string;
  sections: AISectionType[];
}

export interface GenerateContentResponse {
  about?: string;
  key_responsibilities?: string[];
  what_you_will_get?: string[];
  skills_required?: string[];
}
