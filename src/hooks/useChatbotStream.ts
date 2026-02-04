import { useState } from "react";
import { streamChatbotMessage } from "./chatbot.api";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
  question?: string;
  options?: string[] | null;
  fieldType?: string;
}

export function useChatbotStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const sendMessage = async (message: string) => {
    setLoading(true);
    setStreamingMessage("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      let lastStructuredData: any = null;

      await streamChatbotMessage(message, async ({ type, data }) => {
        if (type === "chunk") {
          const textChunk = typeof data === "string" ? data : data.text || "";
          setStreamingMessage((prev) => prev + textChunk);
        }

        if (type === "structured") {
          lastStructuredData = data;
          if (data.message) {
            const fullText =
              data.message + (data.question ? "\n\n" + data.question : "");
            setStreamingMessage(fullText);
          }
        }

        if (type === "complete") {
          if (lastStructuredData) {
            setMessages((prev) => [
              ...prev,
              {
                role: "bot",
                content: lastStructuredData.message || "",
                question: lastStructuredData.question || "",
                options: lastStructuredData.options || null,
                fieldType: lastStructuredData.fieldType || "text",
              },
            ]);
            setOnboardingCompleted(data.onboardingCompleted || false);
          }

          setStreamingMessage("");
          setLoading(false);
        }

        if (type === "error") {
          setStreamingMessage("");
          setLoading(false);
        }
      });
    } catch (err) {
      setStreamingMessage("");
      setLoading(false);
    }
  };

  return {
    messages,
    streamingMessage,
    loading,
    onboardingCompleted,
    sendMessage,
  };
}
