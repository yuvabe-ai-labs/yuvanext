import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/Pagination";
import { Search, Building2, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRecentUnits } from "@/hooks/useUnit";

export default function UnitsManagement() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6;

  // Fetch all units
  const unitsQuery = useRecentUnits(page, pageSize);

  const rawItems = unitsQuery.data?.data ?? [];
  const pagination = unitsQuery.data?.pagination;

  // Client-side filtering for search (API should handle this in production)
  const items = searchQuery
    ? rawItems.filter((item: any) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : rawItems;

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <div className="w-full mx-auto px-4 sm:px-12 lg:px-40 py-6 lg:py-10">
        <div className="relative flex items-center mb-6">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-md font-medium text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>

          {/* Center title */}
          <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-600 whitespace-nowrap">
            Units List
          </h2>

          {/* Right */}
          <div className="ml-auto relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by names"
              className="pl-10 rounded-full border-gray-300"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="px-4 md:px-20">
          {/* Content Area */}
          {unitsQuery.isLoading ? (
            <div className="text-center py-20 text-gray-400 font-medium">
              Loading data...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <Building2 className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-400">
                No Units Found
              </h3>
            </div>
          ) : (
            <>
              {/* 1. Increased gap to 6 or 8 to better distribute space */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((unit: any) => {
                  return (
                    <Card
                      key={unit.userId}
                      /* 2. CHANGED: w-full instead of w-[256px], added max-w to maintain shape */
                      className="relative overflow-hidden rounded-[20px] border border-[#C94100] bg-white shadow-sm transition-all duration-300 hover:shadow-md w-full max-w-[360px] h-[300px] p-1.5 mx-auto"
                    >
                      {/* Banner */}
                      <div className="relative w-full h-[100px] rounded-t-[18px] overflow-visible bg-blue-500">
                        {unit.bannerUrl ? (
                          <img
                            src={
                              unit.bannerUrl || "/assets/banner-placeholder.jpg"
                            }
                            alt=""
                            className="h-full w-full object-cover rounded-[18px]"
                          />
                        ) : (
                          ""
                        )}
                        {/* Avatar */}
                        <div className="absolute bottom-0 left-5 translate-y-1/6 w-[56px] h-[56px] flex items-center justify-center z-20 rounded-full bg-black text-white">
                          {unit.avatarUrl ? (
                            <img
                              src={unit.avatarUrl}
                              alt={`${unit.name} logo`}
                              className="w-[54px] h-[54px] object-cover rounded-full"
                            />
                          ) : (
                            unit.name?.charAt(0) || "U"
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="-mt-[28px] bg-white rounded-[18px] pt-[40px] pb-[20px] px-[16px] z-10 relative">
                        <h3 className="text-[20px] font-semibold text-black leading-tight text-left">
                          {unit.name}
                        </h3>
                        <p className="text-[14px] text-black mt-1 line-clamp-3 text-left">
                          {unit.description}
                        </p>
                        <div className="flex justify-center mt-3">
                          <Button
                            variant="link"
                            className="text-[#0B5FFF] font-medium p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/units/${unit.userId}`);
                            }}
                          >
                            View Candidates
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setPage}
                className="mt-10"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
