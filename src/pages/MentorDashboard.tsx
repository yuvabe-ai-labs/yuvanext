import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/Navbar";
import StatsGrid from "@/components/StatsGrid";
import PerformanceChart from "@/components/PerformanceChart";
import RecentMenteeActivity from "@/components/RecentMenteeActivity";
import UpcomingMeetings from "@/components/UpcomingMeetings";
import MenteesList from "@/components/MenteesList";

export default function MentorDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const formattedDate = format(new Date(), "EEEE, dd MMMM yyyy");

  const isNewUser = user?.createdAt
    ? new Date().getTime() - new Date(user.createdAt).getTime() <
      24 * 60 * 60 * 1000
    : false;

  const greeting = isNewUser ? "Welcome" : "Welcome back";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-8 lg:px-12 xl:px-16 lg:py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base text-gray-500">{formattedDate}</p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900 sm:text-4xl">
              {greeting}, {user?.name || user?.email?.split("@")[0] || "Mentor"}
            </h1>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              aria-label="Search mentees"
              className="h-12 w-full rounded-full border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400"
            />
          </div>
        </div>

        {/* Overview + activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-7 lg:col-span-2">
            <StatsGrid />

            <div className="my-7 border-t border-gray-100" />

            <PerformanceChart />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-3">
            <RecentMenteeActivity />
            <UpcomingMeetings />
          </div>
        </div>

        {/* Mentees */}
        <div className="mt-6">
          <MenteesList search={debouncedSearch} />
        </div>
      </div>
    </div>
  );
}
