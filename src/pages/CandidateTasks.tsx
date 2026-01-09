import Navbar from "@/components/Navbar";
import { useState } from "react";
import ApplicationStatusCard from "@/components/ApplicationStatusCard";
import OfferCard from "@/components/OfferCard";
import { useAppliedInternshipStatus } from "@/hooks/useInternships";
import { useSession } from "@/lib/auth-client";

export default function CandidateTasks() {
  const [selected, setSelected] = useState("Tasks Management");
  const { data: session } = useSession();
  const { data: applicationsData, isLoading: applicationsLoading } =
    useAppliedInternshipStatus();

  const menuItems = ["Tasks Management", "Application Status"];

  return (
    <div className="bg-[#F8F9FA]">
      <Navbar />
      <div className="flex h-screen mx-24 bg-white">
        {/* Left Sidebar */}
        <aside className="w-[20%] border-r-2 border-gray-300">
          <h2 className="text-2xl font-medium px-5 pt-5">Applications</h2>

          <div className="flex flex-col">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setSelected(item)}
                className={`px-7 py-5 text-left border-b border-gray-200 font-medium  ${
                  item === selected ? "text-blue-500" : "text-gray-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Content */}
        <main className="w-[80%] px-20 py-10 overflow-y-auto">
          <h1 className="text-xl font-medium text-gray-800 mb-7">{selected}</h1>

          {selected === "Tasks Management" && (
            <div>
              {applicationsLoading ? (
                <p className="text-gray-500">Loading offers...</p>
              ) : applicationsData &&
                Array.isArray(applicationsData) &&
                applicationsData.length > 0 ? (
                (() => {
                  const hiredApplications = applicationsData.filter(
                    (app) => app.status === "hired"
                  );

                  return hiredApplications.length > 0 ? (
                    <div className="space-y-4">
                      {hiredApplications.map((application) => (
                        <OfferCard
                          key={application.id}
                          application={application}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">
                        No pending offers at the moment
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Your internship offers will appear here
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No pending offers at the moment
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Your internship offers will appear here
                  </p>
                </div>
              )}
            </div>
          )}

          {selected === "Application Status" && (
            <div>
              {applicationsLoading ? (
                <p className="text-gray-500">Loading applications...</p>
              ) : applicationsData &&
                Array.isArray(applicationsData) &&
                applicationsData.length > 0 ? (
                applicationsData.map((application) => (
                  <ApplicationStatusCard
                    key={application.id}
                    application={application}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No applications yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Your applications will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
