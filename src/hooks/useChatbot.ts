import { useState, useCallback, useRef } from "react";
import { sendChatbotMessageStreaming } from "@/services/chatbot.service";
import type { ChatbotRequest } from "@/types/chatbot.types";

interface UseChatbotStreamingReturn {
  sendMessage: (
    request: ChatbotRequest,
    onChunk: (chunk: string) => void,
    onComplete: (data: {
      fullResponse: string;
      onboardingCompleted?: boolean;
    }) => void
  ) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  abort: () => void;
}

export const useChatbotStreaming = (): UseChatbotStreamingReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      request: ChatbotRequest,
      onChunk: (chunk: string) => void,
      onComplete: (data: {
        fullResponse: string;
        onboardingCompleted?: boolean;
      }) => void
    ) => {
      setIsLoading(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        await sendChatbotMessageStreaming(
          request,
          onChunk,
          (data) => {
            onComplete(data);
            setIsLoading(false);
          },
          (err) => {
            if (err.name !== "AbortError") {
              setError(err);
              setIsLoading(false);
            }
          }
        );
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err);
          setIsLoading(false);
        }
      }
    },
    []
  );

  return {
    sendMessage,
    isLoading,
    error,
    abort,
  };
};

// Export as default as well for convenience
export default useChatbotStreaming;
