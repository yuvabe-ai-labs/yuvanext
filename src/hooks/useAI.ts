import { useMutation } from "@tanstack/react-query";
import { enhanceCandidateProfile, generateInternshipContent } from "@/services/ai.service";
import type { EnhanceProfilePayload, GenerateContentPayload } from "@/types/ai.types";

export const useGenerateContent = () => {
  return useMutation({
    mutationFn: (payload: GenerateContentPayload) =>
      generateInternshipContent(payload),
  });
};

export const useEnhanceProfile = () => {
  return useMutation({
    mutationFn: (payload: EnhanceProfilePayload) =>
      enhanceCandidateProfile(payload),
  });
};