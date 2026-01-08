export interface ChatbotRequest {
  message: string;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface ChatbotResponse {
  success: boolean;
  response: string;
  options?: string[];
  error?: string;
}
