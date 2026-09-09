import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MentorAcceptedCandidate } from "@/types/mentor.types";

/** One row of GET /mentor/accepted-candidates. */
export type MenteeCardItem = MentorAcceptedCandidate;

interface MenteeCardProps {
  mentee: MenteeCardItem;
  /** Extra classes on the card wrapper, e.g. a fixed width for horizontal scrollers. */
  className?: string;
}

const MAX_VISIBLE_SKILLS = 3;

/**
 * Shared mentee card used by the mentor dashboard list and the mentees
 * management grid, so both stay visually identical (including the 3-line
 * clamp on the profile summary).
 */
export default function MenteeCard({ mentee, className }: MenteeCardProps) {
  const navigate = useNavigate();

  const candidate = mentee.candidate;
  const application = mentee.application;

  const skills = Array.isArray(candidate?.skills) ? candidate.skills : [];
  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
  const hiddenSkillCount = skills.length - visibleSkills.length;

  const profileSummary =
    candidate?.profileSummary || "No profile summary available.";

  const initials =
    candidate?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "C";

  // The candidate profile route resolves by candidate userId
  // (GET /mentor/candidates/:candidateId), never by applicationId.
  const candidateUserId = candidate?.userId;

  return (
    <Card
      className={cn(
        "flex h-full flex-col rounded-3xl border border-border/50 transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <CardContent className="flex flex-1 flex-col space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Avatar className="h-16 w-16 shrink-0 ring-4 ring-green-500 sm:h-20 sm:w-20">
            <AvatarImage
              src={candidate?.avatarUrl ?? undefined}
              alt={candidate?.name ?? "Candidate"}
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-200 font-semibold text-gray-700">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Name and role only — vertically centred against the avatar. */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
              {candidate?.name || "Unknown Candidate"}
            </h3>

            <p className="mt-1 truncate text-xs text-gray-700 sm:text-sm">
              {application?.internshipTitle || "No active application"}
            </p>
          </div>
        </div>

        {/* Profile summary. The clamped <p> must NOT be the flex-growing element:
            when flex stretches a -webkit-box taller than its clamp, the text is
            cropped without the trailing ellipsis. The wrapper absorbs the spare
            height instead, so the <p> stays exactly 3 lines tall and truncates. */}
        <div className="flex-1">
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-700 sm:text-base">
            {profileSummary}
          </p>
        </div>

        {/* Skills */}
        <div className="min-h-7">
          {skills.length > 0 && (
            <div className="flex gap-2 overflow-hidden">
              {visibleSkills.map((skill: string, i: number) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="whitespace-nowrap rounded-full bg-muted/40 px-2 py-1 text-[10px] text-gray-600"
                >
                  {skill}
                </Badge>
              ))}
              {hiddenSkillCount > 0 && (
                <Badge
                  variant="outline"
                  className="whitespace-nowrap rounded-full bg-muted/40 px-2 py-1 text-[10px] text-gray-600"
                >
                  +{hiddenSkillCount}
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="my-1 border-t border-border/40"></div>

        <Button
          variant="outline"
          size="lg"
          disabled={!candidateUserId}
          className="mt-auto w-full cursor-pointer rounded-full border-2 border-teal-500 py-3 text-sm text-teal-600 hover:bg-teal-50"
          onClick={() => navigate(`/candidate/${candidateUserId}`)}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
