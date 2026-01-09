import axiosInstance from "@/config/platform-api";
import type { ChatbotRequest, ChatbotResponse } from "@/types/chatbot.types";

// Keep the old non-streaming function for backwards compatibility
export const sendChatbotMessage = async (
  payload: ChatbotRequest
): Promise<ChatbotResponse> => {
  try {
    const response = await axiosInstance.post("/chatbot", payload);
    return response.data as ChatbotResponse;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.error || "Failed to send chatbot message"
    );
  }
};

// NEW: Streaming function using fetch API
export const sendChatbotMessageStreaming = async (
  payload: ChatbotRequest,
  onChunk: (chunk: string) => void,
  onComplete: (data: {
    fullResponse: string;
    onboardingCompleted?: boolean;
  }) => void,
  onError: (error: Error) => void
): Promise<void> => {
  console.log("ðŸš€ Starting streaming request...");

  try {
    // Get the base URL from axios instance
    const baseURL = axiosInstance.defaults.baseURL || "";

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    console.log("ðŸ“¤ Sending request to:", `${baseURL}/chatbot`);

    // CRITICAL: Include credentials to send Better Auth session cookies
    const response = await fetch(`${baseURL}/chatbot`, {
      method: "POST",
      headers,
      credentials: "include", // This is the key fix for Better Auth!
      body: JSON.stringify(payload),
    });

    console.log("ðŸ“¥ Response status:", response.status);
    console.log("ðŸ“¥ Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      let errorMessage = "Failed to send message";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Check if response is streaming or JSON
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      console.log("ðŸ“¦ Received JSON response (non-streaming)");
      // Non-streaming response (e.g., already completed onboarding)
      const data = await response.json();
      if (data.success) {
        onComplete({
          fullResponse: data.response,
          onboardingCompleted: data.onboardingCompleted,
        });
      } else {
        throw new Error(data.error || "Failed to get response");
      }
      return;
    }

    console.log("ðŸŒŠ Starting SSE stream...");

    // Handle SSE streaming
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response stream available");
    }

    let buffer = "";
    let fullResponse = "";
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("âœ… Stream complete. Total chunks:", chunkCount);
        break;
      }

      const decoded = decoder.decode(value, { stream: true });
      console.log(
        "ðŸ“¨ Raw chunk received:",
        decoded.substring(0, 100) + "..."
      );

      buffer += decoded;

      // Process complete SSE messages (ending with \n\n)
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        console.log("ðŸ” Processing line:", line.substring(0, 100));

        // Parse SSE format: "event: eventName\ndata: jsonData"
        const eventMatch = line.match(/event:\s*(\w+)/);
        const dataMatch = line.match(/data:\s*(.+)/s);

        if (!eventMatch || !dataMatch) {
          console.warn("âš ï¸ Malformed SSE line:", line);
          continue;
        }

        const eventType = eventMatch[1];
        const eventData = JSON.parse(dataMatch[1]);

        console.log(`ðŸ“¬ Event: ${eventType}`, eventData);

        switch (eventType) {
          case "start":
            console.log("ðŸŽ¬ Stream started");
            break;

          case "chunk":
            // Send each chunk to the callback
            const text = eventData.text || "";
            fullResponse += text;
            chunkCount++;
            console.log(`ðŸ’¬ Chunk ${chunkCount}:`, text);
            onChunk(text);
            break;

          case "complete":
            console.log("ðŸ Stream completed");
            // Stream completed
            onComplete({
              fullResponse: eventData.fullResponse || fullResponse,
              onboardingCompleted: eventData.onboardingCompleted,
            });
            break;

          case "error":
            console.error("âŒ Stream error:", eventData.error);
            throw new Error(eventData.error || "Streaming error occurred");
        }
      }
    }
  } catch (error: any) {
    console.error("ðŸ’¥ Streaming error:", error);
    onError(error);
  }
};
