import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAcceptedCandidatesList } from "@/hooks/useMentees";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-amber-400 text-white" },
  shortlisted: { label: "Shortlisted", className: "bg-emerald-500 text-white" },
  not_shortlisted: {
    label: "Not Shortlisted",
    className: "bg-red-500 text-white",
  },
  interviewed: { label: "Interviewed", className: "bg-blue-500 text-white" },
  hired: { label: "Hired", className: "bg-teal-600 text-white" },
};

const FALLBACK_STATUS = {
  label: "No application",
  className: "bg-gray-200 text-gray-600",
};

interface MenteesListProps {
  /** Filters the list server-side by candidate name. */
  search?: string;
}

export default function MenteesList({ search = "" }: MenteesListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: responseData, isLoading } = useAcceptedCandidatesList(
    1,
    10,
    search
  );
  const candidates = responseData?.data || [];

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 370;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Mentees List</h2>
        <button
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          onClick={() => navigate("/mentees-management")}
        >
          View all
        </button>
      </div>

      <div className="relative mt-6">
        {candidates.length > 0 && (
          <>
            <button
              aria-label="Scroll mentees left"
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition-colors hover:bg-gray-50 md:block"
            >
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            </button>

            <button
              aria-label="Scroll mentees right"
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2.5 shadow-sm transition-colors hover:bg-gray-50 md:block"
            >
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-6 overflow-x-auto py-2 md:px-14"
        >
          {isLoading ? (
            <div className="w-full animate-pulse py-16 text-center text-sm text-gray-400">
              Loading mentees...
            </div>
          ) : candidates.length === 0 ? (
            <div className="w-full py-16 text-center text-sm text-gray-400">
              {search
                ? `No mentees match "${search}".`
                : "No active mentees found."}
            </div>
          ) : (
            candidates.map((mentee: any) => {
              const candidate = mentee.candidate;
              const appInfo = mentee.application;

              const internshipTitle =
                appInfo?.internshipTitle || "No active internship";
              const status = appInfo?.status
                ? STATUS_STYLES[appInfo.status] ?? {
                    label: appInfo.status,
                    className: "bg-gray-200 text-gray-600",
                  }
                : FALLBACK_STATUS;
              const skills = Array.isArray(candidate?.skills)
                ? candidate.skills
                : [];
              const profileSummary =
                candidate?.profileSummary ||
                "Passionate about creating user-centered digital experiences.";

              return (
                <article
                  key={mentee.requestId}
                  className="flex min-h-[360px] w-[330px] min-w-[330px] flex-col rounded-3xl border border-gray-200 p-6 transition-shadow hover:shadow-lg"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 shrink-0 ring-2 ring-blue-500 ring-offset-2">
                      <AvatarImage
                        src={candidate?.avatarUrl ?? undefined}
                        alt={candidate?.name ?? "Mentee"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-200 font-semibold text-gray-700">
                        {candidate?.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "M"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-gray-900">
                        {candidate?.name || "Unknown"}
                      </h3>
                      <p className="mt-0.5 truncate text-sm text-gray-500">
                        {internshipTitle}
                      </p>
                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="mt-5 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                    {profileSummary}
                  </p>

                  {/* Skills */}
                  <div className="mt-4 flex min-h-7 flex-wrap gap-2 overflow-hidden">
                    {skills.slice(0, 3).map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 3 && (
                      <span className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        +{skills.length - 3}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="mt-6 w-full rounded-full border-teal-600 py-5 text-sm font-semibold text-teal-700 hover:bg-teal-50 hover:text-teal-700"
                    onClick={() => navigate(`/candidate/${candidate?.userId}`)}
                  >
                    View Profile
                  </Button>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
