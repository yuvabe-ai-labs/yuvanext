import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import type { Internship } from "@/types/internships.types";

const getShortTimeAgo = (date: string | Date) => {
  const now = new Date();
  const past = new Date(date);

  const days = differenceInDays(now, past);
  if (days > 0) return `${days}d`;

  const hours = differenceInHours(now, past);
  if (hours > 0) return `${hours}h`;

  const minutes = differenceInMinutes(now, past);
  if (minutes > 0) return `${minutes}m`;

  return "just now";
};

interface InternshipCardProps {
  internship: Internship;
  onClick: () => void;
}

const InternshipCard = ({ internship, onClick }: InternshipCardProps) => {
  const timeAgo = getShortTimeAgo(internship.updatedAt);

  return (
    <Card
      className="min-w-0 px-5 py-4 hover:shadow-lg transition-all cursor-pointer rounded-xl border border-gray-300"
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center text-background font-bold">
            {internship.createdBy?.avatarUrl ? (
              <img
                src={internship.createdBy.avatarUrl}
                alt={internship.createdBy.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              internship.createdBy?.name?.charAt(0) || "C"
            )}
          </div>
          <Badge className="bg-primary text-primary-foreground">{`Posted ${timeAgo} ago`}</Badge>
        </div>

        {internship.title ? (
          // Single line; the ellipsis appears only when the title overflows the card
          <h3
            className="text-4 font-semibold text-gray-900 truncate"
            title={internship.title}
          >
            {internship.title}
          </h3>
        ) : (
          "Title"
        )}

        <p className="text-sm text-gray-500 line-clamp-3">
          {internship.description || "No description available"}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{internship.duration || "Not specified"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InternshipCard;
