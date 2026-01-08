import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Trash2, StopCircle } from "lucide-react";

const ChatbotStreamTester = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState("http://localhost:9999/api/chatbot");
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);

    // Add user message to chat
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Prepare conversation history
    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const payload = {
      message: userMessage,
      conversationHistory,
    };

    setIsStreaming(true);
    setStreamingMessage("");

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal,
      });

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

      const contentType = response.headers.get("content-type");

      // Handle non-streaming JSON response
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.response,
              timestamp: new Date().toISOString(),
              onboardingCompleted: data.onboardingCompleted,
            },
          ]);
        } else {
          throw new Error(data.error || "Failed to get response");
        }
        setIsStreaming(false);
        return;
      }

      // Handle SSE streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream available");
      }

      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (ending with \n\n)
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse SSE format
          const eventMatch = line.match(/event:\s*(\w+)/);
          const dataMatch = line.match(/data:\s*(.+)/s);

          if (!eventMatch || !dataMatch) continue;

          const eventType = eventMatch[1];
          const eventData = JSON.parse(dataMatch[1]);

          switch (eventType) {
            case "start":
              console.log("Stream started");
              break;

            case "chunk":
              const text = eventData.text || "";
              fullResponse += text;
              setStreamingMessage((prev) => prev + text);
              break;

            case "complete":
              // Add complete message to chat
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: eventData.fullResponse || fullResponse,
                  timestamp: new Date().toISOString(),
                  onboardingCompleted: eventData.onboardingCompleted,
                },
              ]);
              setStreamingMessage("");
              break;

            case "error":
              throw new Error(eventData.error || "Streaming error occurred");
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Streaming error:", err);
        setError(err.message);
      }
      setStreamingMessage("");
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setStreamingMessage("");
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingMessage("");
    setError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-3">
            Chatbot Stream Tester
          </h1>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="API URL"
            />
            <button
              onClick={clearChat}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 size={18} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && !streamingMessage && (
            <div className="text-center text-slate-400 mt-20">
              <p className="text-lg">No messages yet</p>
              <p className="text-sm mt-2">
                Send a message to start testing the chatbot
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase">
                    {msg.role}
                  </span>
                  {msg.onboardingCompleted !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        msg.onboardingCompleted
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-black"
                      }`}
                    >
                      {msg.onboardingCompleted
                        ? "Onboarding Done"
                        : "Onboarding Pending"}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className="text-xs opacity-60 mt-2">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-3 bg-slate-700 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase">
                    Assistant
                  </span>
                  <Loader2 size={14} className="animate-spin" />
                </div>
                <p className="whitespace-pre-wrap break-words">
                  {streamingMessage}
                  <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse"></span>
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500 text-white rounded-lg px-4 py-3">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <StopCircle size={20} />
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send size={20} />
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotStreamTester;
