import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PublicHeader from "@/components/PublicHeader";
import InternshipCard from "@/components/InternshipCard";
import { usePublicInternships } from "@/hooks/useInternships";

const PublicJobBoard = () => {
  const navigate = useNavigate();
  const { data: internships = [], isLoading, error } = usePublicInternships();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container px-4 sm:px-6 lg:px-[7.5rem] py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Find your next opportunity
          </h1>
          <p className="text-gray-600 mt-1">
            {isLoading
              ? "Loading opportunities..."
              : `Explore ${internships.length} Internship${
                  internships.length !== 1 ? "s" : ""
                }`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={`skeleton-${i}`}
                className="px-5 py-4 rounded-xl border border-gray-300"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Couldn't load internships. Please try again later.
            </p>
          </div>
        ) : internships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No internships are open right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {internships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onClick={() => navigate(`/jobs/${internship.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicJobBoard;
