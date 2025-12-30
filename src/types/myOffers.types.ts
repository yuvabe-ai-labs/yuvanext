export type OfferDecision = "pending" | "accepted" | "rejected";

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "rejected"
  | "interviewed"
  | "hired";

export interface Offer {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  offer_decision: OfferDecision;
  applied_date: string;
  cover_letter: string;
  internship: OfferInternship;
}

export interface OfferInternship {
  id: string;
  title: string;
  description: string;
  duration: string;
  created_by: string;
  company_profile: OfferCompanyProfile;
}

export interface OfferCompanyProfile {
  id: string;
  full_name: string;
  email: string;
  unit: OfferUnit;
}

export interface OfferUnit {
  unit_name: string;
  avatar_url: string;
}

export interface MyOffersResponse {
  data: Offer[];
  error: any;
}
