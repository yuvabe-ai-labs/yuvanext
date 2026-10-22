import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PublicHeader from "@/components/PublicHeader";
import InternshipCard from "@/components/InternshipCard";
import { usePublicInternships } from "@/hooks/useInternships";

const PublicJobBoard = () => {
  const navigate = useNavigate();
  const { data: internships = [], isLoading, error } = usePublicInternships();
  const [search, setSearch] = useState("");

  // Match the search text against the job title or any required skill
  const filteredInternships = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return internships;

    return internships.filter(
      (internship) =>
        internship.title?.toLowerCase().includes(query) ||
        internship.skillsRequired?.some((skill) =>
          skill.toLowerCase().includes(query)
        )
    );
  }, [internships, search]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container px-4 sm:px-6 lg:px-[7.5rem] py-6 lg:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Find your next opportunity
            </h1>
            <p className="text-gray-600 mt-1">
              {isLoading
                ? "Loading opportunities..."
                : `Explore ${filteredInternships.length} Internship${
                    filteredInternships.length !== 1 ? "s" : ""
                  }`}
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by job title or skill"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-gray-400 rounded-3xl"
              aria-label="Search internships by job title or skill"
            />
          </div>
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
        ) : filteredInternships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No internships match "{search.trim()}".
            </p>
            <Button
              variant="outline"
              onClick={() => setSearch("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredInternships.map((internship) => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                onClick={() => navigate(`/jobs/${internship.id}`)}
                showUnitName
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicJobBoard;
