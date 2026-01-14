import { useMutation } from "@tanstack/react-query";
import { generateInternshipContent } from "@/services/ai.service";
import type { GenerateContentPayload } from "@/types/ai.types";

export const useGenerateContent = () => {
  return useMutation({
    mutationFn: (payload: GenerateContentPayload) =>
      generateInternshipContent(payload),
  });
};
