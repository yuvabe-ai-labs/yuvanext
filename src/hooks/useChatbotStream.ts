import { useState, useRef } from "react";
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

  // Use a ref to track typing state so the complete event can wait
  const isTypingRef = useRef(false);

  const simulateTyping = async (fullText: string) => {
    isTypingRef.current = true;
    let currentText = "";
    const speed = 15; // Slightly faster for better UX

    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];
      setStreamingMessage(currentText);
      await new Promise((resolve) => setTimeout(resolve, speed));
    }
    isTypingRef.current = false;
    return currentText;
  };

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
            const textToAnimate =
              data.message + (data.question ? "\n\n" + data.question : "");
            await simulateTyping(textToAnimate);
          }
        }

        if (type === "complete") {
          // LOOP: Wait until typing simulation is finished
          while (isTypingRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

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

          // Clear streaming message ONLY after it has been added to the permanent list
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
