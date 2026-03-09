import { useSession } from "@/lib/auth-client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { format } from "date-fns";
import MenteesList from "@/components/MenteesList";
import StatsGrid from "@/components/StatsGrid";
import SchedulesCard from "@/components/SchedulesCard";

export default function MentorDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const today = new Date();
  const formattedDate = format(today, "EEEE, dd MMMM yyyy");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="w-full mx-auto px-4 sm:px-12 lg:px-40 py-6 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-lg text-muted-foreground">{formattedDate}</p>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name || user?.email?.split("@")[0] || "Mentor"}
          </h1>
        </div>

        <StatsGrid />

        <div className="my-8 border-t border-border/60" />

        <SchedulesCard/>


        <MenteesList />
      </div>
    </div>
  );
}
