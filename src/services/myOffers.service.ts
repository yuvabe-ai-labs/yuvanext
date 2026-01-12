import axiosInstance from "@/config/platform-api";
import type { Offer, MyOffersResponse } from "@/types/myOffers.types";

export const getMyOffers = async (): Promise<MyOffersResponse> => {
  try {
    // GET /api/applications?status=hired
    // Backend should filter by authenticated user and return nested data
    const { data } = await axiosInstance.get("/applications", {
      params: { status: "hired" },
    });

    const applications = Array.isArray(data) ? data : data.applications || [];

    const formatted: Offer[] = applications.map((item) => {
      return {
        id: item.id,
        application_id: item.id,
        status: item.status,
        offer_decision: item.offer_decision,
        applied_date: item.applied_date,
        cover_letter: item.cover_letter,

        internship: {
          id: item.internship?.id ?? "",
          title: item.internship?.title ?? "",
          description: item.internship?.description ?? "",
          duration: item.internship?.duration ?? "",
          starts_on: "",
          created_by: item.internship?.created_by ?? "",
          company_name: item.internship?.company_name ?? "",

          company_profile: {
            id: item.internship?.company_profile?.id ?? "",
            full_name: item.internship?.company_profile?.full_name ?? "",
            email: item.internship?.company_profile?.email ?? "",

            unit: {
              unit_name:
                item.internship?.company_profile?.unit?.unit_name ?? "",
              avatar_url:
                item.internship?.company_profile?.unit?.avatar_url ?? "",
            },
          },
        },
      };
    });

    return {
      data: formatted,
      error: null,
    };
  } catch (err) {
    console.error("Unhandled error fetching offers:", err);
    return { data: [], error: err.message || err };
  }
};

export const updateOfferDecision = async (
  applicationId: string,
  decision: "accepted" | "rejected"
): Promise<{ success: boolean; error? }> => {
  try {
    // PUT /api/applications/{id} with offer_decision
    await axiosInstance.put(`/applications/${applicationId}`, {
      offer_decision: decision,
    });

    return { success: true };
  } catch (err) {
    console.error("Unhandled error updating offer:", err);
    return { success: false, error: err.message || err };
  }
};
