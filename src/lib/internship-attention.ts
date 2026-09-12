/**
 * "Needs more attention" = a mentee in the final month of their internship.
 *
 * There is no internship start/end column, so the window is derived from the
 * hire date (`applications.updatedAt`, surfaced as `hiredAt`) plus the
 * internship's duration. Duration is free text entered per internship
 * ("3 months", "3 MONTHS", "6 Months"), so it is parsed leniently.
 *
 * Both the dashboard tile and the activities list use this, so the count on
 * the tile always matches the rows behind it.
 */

interface AttentionInput {
  hiredAt?: string | null;
  internshipDuration?: string | null;
}

/** Months implied by a free-text duration, or null if it can't be read. */
export const parseDurationMonths = (
  duration?: string | null,
): number | null => {
  if (!duration) return null;

  const match = duration.trim().match(/(\d+(?:\.\d+)?)\s*(year|month|week|day)/i);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  switch (match[2].toLowerCase()) {
    case "year":
      return amount * 12;
    case "month":
      return amount;
    case "week":
      return (amount * 7) / 30;
    case "day":
      return amount / 30;
    default:
      return null;
  }
};

/** End of the internship, or null when either input is unusable. */
export const getInternshipEndDate = ({
  hiredAt,
  internshipDuration,
}: AttentionInput): Date | null => {
  if (!hiredAt) return null;

  const start = new Date(hiredAt);
  if (Number.isNaN(start.getTime())) return null;

  const months = parseDurationMonths(internshipDuration);
  if (months === null) return null;

  const end = new Date(start);
  // Fractional months (from weeks/days) fall back to whole days.
  if (Number.isInteger(months)) {
    end.setMonth(end.getMonth() + months);
  } else {
    end.setDate(end.getDate() + Math.round(months * 30));
  }
  return end;
};

/**
 * True while "now" sits inside the last month before the internship ends.
 * Internships that have already finished are excluded — they are over, not
 * in need of attention.
 */
export const needsAttention = (
  entry: AttentionInput,
  now: Date = new Date(),
): boolean => {
  const end = getInternshipEndDate(entry);
  if (!end) return false;

  const finalMonthStart = new Date(end);
  finalMonthStart.setMonth(finalMonthStart.getMonth() - 1);

  return now >= finalMonthStart && now <= end;
};
