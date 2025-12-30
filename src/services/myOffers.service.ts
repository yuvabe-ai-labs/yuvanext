import { supabase } from "@/integrations/supabase/client";
import type { Offer, MyOffersResponse } from "@/types/myOffers.types";

export const getMyOffers = async (
  userId: string
): Promise<MyOffersResponse> => {
  try {
    // STEP 1 – Get student profile ID
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (profileErr || !profile) {
      return { data: [], error: profileErr ?? "Profile not found" };
    }

    const studentProfileId = profile.id;

    // STEP 2 – Fetch ALL hired applications (pending, accepted, rejected)
    const { data, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        status,
        offer_decision,
        applied_date,
        cover_letter,

        internship:internship_id (
          id,
          title,
          description,
          duration,
          created_by,
          company_name,

          company_profile:created_by (
            id,
            full_name,
            email,

            unit:units (
              unit_name,
              avatar_url
            )
          )
        )
      `
      )
      .eq("student_id", studentProfileId)
      .eq("status", "hired")
      .order("applied_date", { ascending: false });

    if (error) {
      console.error("Error fetching offers:", error);
      return { data: [], error };
    }

    const formatted: Offer[] =
      data?.map((item: any) => {
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
      }) ?? [];

    return {
      data: formatted,
      error: null,
    };
  } catch (err: any) {
    console.error("Unhandled error fetching offers:", err);
    return { data: [], error: err.message || err };
  }
};

export const updateOfferDecision = async (
  applicationId: string,
  decision: "accepted" | "rejected"
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from("applications")
      .update({ offer_decision: decision })
      .eq("id", applicationId);

    if (error) {
      console.error("Error updating offer decision:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unhandled error updating offer:", err);
    return { success: false, error: err.message || err };
  }
};
