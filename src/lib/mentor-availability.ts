/**
 * Mentor availability time windows arrive in three shapes, because the chatbot
 * and the profile dialog have written this column differently over time:
 *
 *   1. an array of { start, end }        — the current, correct shape
 *   2. a JSON string of that array       — an old double-encoding bug
 *   3. a free-text string, "9 AM - 12 PM" — the earliest chatbot answers
 *
 * The profile card handled (3) by printing it verbatim while the edit dialog
 * dropped it, so opening the dialog showed "No time windows set" and saving
 * replaced the real value with an empty array. Both now share this parser.
 */
export interface TimeWindow {
  start: string;
  end: string;
}

/** "9", "9:30", "9 AM", "5 pm" -> "09:00" / "09:30" / "17:00" */
const toTwentyFourHour = (
  hour: string,
  minute: string | undefined,
  meridiem: string | undefined,
): string => {
  let h = Number.parseInt(hour, 10);
  if (!Number.isFinite(h)) return "";

  const m = meridiem?.trim().toLowerCase();
  if (m?.startsWith("p") && h !== 12) h += 12;
  if (m?.startsWith("a") && h === 12) h = 0;

  return `${String(h).padStart(2, "0")}:${minute ?? "00"}`;
};

/** Reads one free-text range such as "9 AM - 12 PM" or "14:00 to 16:30". */
const parseRange = (text: string): TimeWindow | null => {
  const match = text.match(
    /(\d{1,2})(?::(\d{2}))?\s*([ap]\.?m\.?)?\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*([ap]\.?m\.?)?/i,
  );
  if (!match) return null;

  const [, startH, startM, startMeridiem, endH, endM, endMeridiem] = match;
  const end = toTwentyFourHour(endH, endM, endMeridiem);

  // "9 - 12 PM" states the meridiem once, at the end. Borrowing it for the
  // start is only right when the result still precedes the end — "9 PM to
  // 12 PM" is backwards, so fall back to AM and read it as 09:00-12:00.
  let start = toTwentyFourHour(startH, startM, startMeridiem ?? endMeridiem);
  if (!startMeridiem && endMeridiem && start > end) {
    start = toTwentyFourHour(startH, startM, "am");
  }

  return start && end ? { start, end } : null;
};

const isTimeWindow = (value: unknown): value is TimeWindow =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as TimeWindow).start === "string" &&
  typeof (value as TimeWindow).end === "string";

/**
 * Normalises any stored shape into a list of windows. Returns an empty list
 * only when the value genuinely holds no readable window.
 */
export const parseTimeWindows = (raw: unknown): TimeWindow[] => {
  if (Array.isArray(raw)) return raw.filter(isTimeWindow);

  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return [];

    if (text.startsWith("[")) {
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed.filter(isTimeWindow) : [];
      } catch {
        return [];
      }
    }

    // Free text: "9 AM - 12 PM and 2 PM - 5 PM", "9-12, 14:00 to 16:00"
    return text
      .split(/\s*(?:,|;|\band\b)\s*/i)
      .map(parseRange)
      .filter((window): window is TimeWindow => window !== null);
  }

  return [];
};
