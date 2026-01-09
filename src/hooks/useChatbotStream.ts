import { useState } from "react";
import { streamChatbotMessage } from "./chatbot.api";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

export function useChatbotStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const sendMessage = async (message: string) => {
    setLoading(true);
    setStreamingText("");

    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      await streamChatbotMessage(message, ({ type, data }) => {
        if (type === "chunk") {
          setStreamingText((prev) => prev + data.text);
        }

        if (type === "complete") {
          setMessages((prev) => [
            ...prev,
            { role: "bot", content: data.fullResponse },
          ]);
          setStreamingText("");
          setOnboardingCompleted(data.onboardingCompleted);
        }

        if (type === "error") {
          console.error("Chatbot error:", data);
        }
      });
    } catch (err) {
      console.error("Streaming failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    streamingText,
    loading,
    onboardingCompleted,
    sendMessage,
  };
}
