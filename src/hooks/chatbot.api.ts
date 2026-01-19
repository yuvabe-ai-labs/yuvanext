const API_BASE_URL = `${import.meta.env.VITE_BETTER_AUTH_URL}/api`;

export async function streamChatbotMessage(
  message: string,
  onEvent: (event: {
    type: "start" | "chunk" | "complete" | "error";
    data: any;
  }) => void
) {
  const response = await fetch(`${API_BASE_URL}/chatbot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 🔑 SAME AS axios withCredentials
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const rawEvent of events) {
      if (!rawEvent.trim()) continue;

      const lines = rawEvent.split("\n");
      const eventType = lines[0]?.replace("event:", "").trim();
      const dataLine = lines.find((l) => l.startsWith("data:"));

      if (!eventType || !dataLine) continue;

      const data = JSON.parse(dataLine.replace("data:", "").trim());

      onEvent({ type: eventType as any, data });
    }
  }
}
