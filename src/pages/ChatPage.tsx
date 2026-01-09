import { useState } from "react";
import { useChatbotStream } from "@/hooks/useChatbotStream";
export default function ChatPage() {
  const { messages, streamingText, sendMessage, loading, onboardingCompleted } =
    useChatbotStream();

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            {msg.content}
          </div>
        ))}

        {streamingText && (
          <div className="msg bot streaming">{streamingText}</div>
        )}
      </div>

      {onboardingCompleted && (
        <div className="completed-banner">🎉 Onboarding Completed!</div>
      )}

      <div className="input-box">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
