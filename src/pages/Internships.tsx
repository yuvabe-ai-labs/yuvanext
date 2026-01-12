import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FilterIcon from "@/assets/filter.svg";
import {
  ChevronRight,
  ChevronLeft,
  CalendarIcon,
  Search,
  Clock,
  Filter,
} from "lucide-react";
// import Navbar from "@/components/Navbar";
import { useInternship } from "@/hooks/useInternships";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  formatDistanceToNow,
} from "date-fns";

const Internship = () => {
  const navigate = useNavigate();
  const { data: internshipsData, isLoading: internshipsLoading } =
    useInternship();

  const allInternships = internshipsData || [];

  const [filters, setFilters] = useState({
    internships: [] as string[],
    industries: [] as string[],
    titles: [] as string[],
    departments: [] as string[],
    interestAreas: [] as string[],
    postingDate: { from: "", to: "" },
  });

  const [activeDateRange, setActiveDateRange] = useState("");
  const [searchUnits, setSearchUnits] = useState("");
  const [searchTitles, setSearchTitles] = useState("");
  const [searchIndustries, setSearchIndustries] = useState("");
  const [showAllUnits, setShowAllUnits] = useState(false);
  const [showAllTitles, setShowAlltitles] = useState(false);
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showMobileFilters]);

  const resetFilters = () => {
    setFilters({
      internships: [],
      industries: [],
      titles: [],
      departments: [],
      interestAreas: [],
      postingDate: { from: "", to: "" },
    });
    setActiveDateRange("");
  };

  const parsePgTimestamp = (ts: any): Date => {
    if (ts instanceof Date) return ts;
    if (!ts) return new Date(NaN);
    let s = String(ts).trim();
    s = s
      .replace(" ", "T")
      .replace(/\.(\d{3})\d+/, ".$1")
      .replace(/\+00:00?$|Z$/i, "Z");
    if (!/[zZ]|[+\-]\d{2}:?\d{2}$/.test(s)) s = s + "Z";
    return new Date(s);
  };

  const uniqueUnits = [
    ...new Set(allInternships.map((i) => i.createdBy?.name).filter(Boolean)),
  ] as string[];

  const uniqueTitles = [
    ...new Set(allInternships.map((i) => i.title).filter(Boolean)),
  ] as string[];

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    if (category === "postingDate") return;
    const list = filters[category] as string[];
    setFilters({
      ...filters,
      [category]: list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    });
  };

  const DateRange = (range: "today" | "week" | "month") => {
    if (activeDateRange === range) {
      setActiveDateRange("");
      setFilters({ ...filters, postingDate: { from: "", to: "" } });
      return;
    }

    const now = new Date();
    let from = new Date();
    if (range === "today") from.setHours(0, 0, 0, 0);
    else if (range === "week") {
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - now.getDay());
      firstDay.setHours(0, 0, 0, 0);
      from = firstDay;
    } else if (range === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    const to = new Date();
    to.setHours(23, 59, 59, 999);
    setActiveDateRange(range);
    setFilters({
      ...filters,
      postingDate: { from: from.toISOString(), to: to.toISOString() },
    });
  };

  const filteredInternships = allInternships.filter((internship) => {
    if (filters.internships.length) {
      const companyName = internship.createdBy?.name;
      if (!companyName || !filters.internships.includes(companyName))
        return false;
    }

    if (filters.titles.length) {
      const title = internship.title;
      if (!title || !filters.titles.includes(title)) return false;
    }

    if (filters.postingDate.from || filters.postingDate.to) {
      const unitDate = parsePgTimestamp(internship.updatedAt).getTime();
      const from = filters.postingDate.from
        ? new Date(filters.postingDate.from).getTime()
        : -Infinity;
      const to = filters.postingDate.to
        ? new Date(filters.postingDate.to).getTime()
        : Infinity;
      if (Number.isNaN(unitDate)) return false;
      if (unitDate < from || unitDate > to) return false;
    }

    return true;
  });

  const getInternshipGradient = (i: number) => {
    const g = [
      "bg-gradient-to-br from-purple-600 to-blue-600",
      "bg-gradient-to-br from-teal-600 to-green-600",
      "bg-gradient-to-br from-orange-600 to-red-600",
      "bg-gradient-to-br from-blue-600 to-cyan-500",
      "bg-gradient-to-br from-pink-600 to-purple-600",
      "bg-gradient-to-br from-gray-700 to-gray-900",
    ];
    return g[i % g.length];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}
      <div className="container px-4 sm:px-6 lg:px-[7.5rem] py-4 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Sidebar Filters */}
          <div className="hidden lg:flex w-full lg:w-80 bg-card pt-5 border border-gray-200 rounded-3xl flex-col lg:h-[90vh] lg:sticky lg:top-6 mb-4 lg:mb-0">
            <div className="flex items-center justify-between mb-4 px-6 py-3 border-b bg-card sticky top-0 z-10">
              <h2 className="text-lg font-bold">Filters</h2>
              <Button
                variant="ghost"
                className="text-primary text-sm font-medium"
                onClick={resetFilters}
              >
                Reset all
              </Button>
            </div>

            <div className="px-6 pb-6 overflow-y-auto flex-1 space-y-6">
              <FilterSection
                label="Units"
                searchValue={searchUnits}
                onSearch={setSearchUnits}
                list={uniqueUnits}
                selected={filters.internships}
                onToggle={(v) => toggleFilter("internships", v)}
                showAll={showAllUnits}
                setShowAll={setShowAllUnits}
              />
              <FilterSection
                label="Internships Title"
                searchValue={searchTitles}
                onSearch={setSearchTitles}
                list={uniqueTitles}
                selected={filters.titles}
                onToggle={(v) => toggleFilter("titles", v)}
                showAll={showAllTitles}
                setShowAll={setShowAlltitles}
              />
              <PostingDateFilter
                filters={filters}
                activeDateRange={activeDateRange}
                onSelectDate={(range) => DateRange(range)}
                onDateChange={setFilters}
              />
            </div>
          </div>
          {showMobileFilters && (
            <>
              {/* Overlay - close when clicked */}
              <div
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                onClick={() => setShowMobileFilters(false)}
              />

              {/* Slide-in Filter Panel */}
              <div className="md:hidden fixed top-0 left-0 h-full w-[75%] bg-white z-50 p-4 overflow-y-auto shadow-xl">
                {/* Header inside filter */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button
                    className="text-primary text-xl"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Same filter components */}
                <FilterSection
                  label="Units"
                  searchValue={searchUnits}
                  onSearch={setSearchUnits}
                  list={uniqueUnits}
                  selected={filters.internships}
                  onToggle={(v) => toggleFilter("internships", v)}
                  showAll={showAllUnits}
                  setShowAll={setShowAllUnits}
                />

                <FilterSection
                  label="Internships Title"
                  searchValue={searchTitles}
                  onSearch={setSearchTitles}
                  list={uniqueTitles}
                  selected={filters.titles}
                  onToggle={(v) => toggleFilter("titles", v)}
                  showAll={showAllTitles}
                  setShowAll={setShowAlltitles}
                />

                <PostingDateFilter
                  filters={filters}
                  activeDateRange={activeDateRange}
                  onSelectDate={(range) => DateRange(range)}
                  onDateChange={setFilters}
                />
              </div>
            </>
          )}

          {/* Main content remains unchanged */}

          <div className="flex-1 w-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-4 lg:hidden w-full">
              {/* Left group: Back + Title */}
              <div className="flex items-center gap-2">
                <button
                  className="text-gray-500 text-xl"
                  onClick={() => window.history.back()}
                >
                  <ChevronLeft size={28} strokeWidth={2} />
                </button>

                <h1 className="text-lg font-bold text-gray-600">
                  Explore {filteredInternships.length} Internship
                  {filteredInternships.length !== 1 ? "s" : ""}
                </h1>
              </div>

              {/* Right: Filter button */}
              <button
                className="text-primary text-xl font-medium"
                onClick={() => setShowMobileFilters(true)}
              >
                <img src={FilterIcon} alt="Filter" className="w-6 h-6" />
              </button>
            </div>

            <div className="hidden lg:block mb-6">
              <h1 className="text-2xl text-gray-600 font-medium">
                Explore {filteredInternships.length} Internship
                {filteredInternships.length !== 1 ? "s" : ""}
              </h1>
            </div>

            {internshipsLoading ? (
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
            ) : (
              <>
                <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredInternships.map((internship, index) => {
                    const gradient = getInternshipGradient(index);
                    const dateToUse = internship.updatedAt;

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

                    const timeAgo = getShortTimeAgo(dateToUse);

                    return (
                      <Card
                        key={internship.id}
                        className="px-5 py-4 hover:shadow-lg transition-all cursor-pointer rounded-xl border border-gray-300"
                        onClick={() =>
                          navigate(`/internships/${internship.id}`)
                        }
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
                            <h3 className="text-4 font-semibold text-gray-900 line-clamp-2">
                              {internship.title.length > 20
                                ? `${internship.title.slice(0, 21)}...`
                                : internship.title}
                            </h3>
                          ) : (
                            "Title"
                          )}

                          <p className="text-sm text-gray-500 line-clamp-3">
                            {internship.description ||
                              "No description available"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {internship.duration || "Not specified"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {!internshipsLoading && filteredInternships.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No internships found matching your filters.
                    </p>
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------ UPDATED FilterSection ------------------ */
const FilterSection = ({
  label,
  searchValue,
  onSearch,
  list,
  selected,
  onToggle,
  showAll,
  setShowAll,
}: any) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch(value);
    setShowDropdown(value.trim().length > 0);
  };

  const filteredSearchResults = list.filter((item: string) =>
    item.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="relative">
      <Label className="text-sm font-medium text-gray-500 mb-3 block">
        {label}
      </Label>

      {/* ✅ Single Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${label}...`}
          value={searchValue}
          onChange={handleSearchChange}
          className="pl-8 border-gray-400 rounded-3xl"
          onFocus={() => searchValue.trim().length > 0 && setShowDropdown(true)}
        />
      </div>

      {/* ✅ Search Dropdown (filtered results) */}
      {showDropdown && filteredSearchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full bg-card border rounded-xl shadow-md max-h-56 overflow-auto"
        >
          {filteredSearchResults.map((item: string) => (
            <div
              key={item}
              onClick={() => {
                onToggle(item);
                setShowDropdown(false);
              }}
              className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-muted transition ${
                selected.includes(item) ? "bg-muted/50" : ""
              }`}
            >
              <span>{item}</span>
              <Checkbox checked={selected.includes(item)} />
            </div>
          ))}
          {filteredSearchResults.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No {label} found.
            </div>
          )}
        </div>
      )}

      {/* ✅ Always visible checkbox list below */}
      <div className="space-y-3 mt-3">
        {(showAll ? list : list.slice(0, 4)).map((item: string) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              checked={selected.includes(item)}
              onCheckedChange={() => onToggle(item)}
            />
            <span className="text-sm">{item}</span>
          </div>
        ))}
        {list.length > 4 && (
          <Button
            variant="link"
            className="p-0 text-primary text-sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : `+${list.length - 4} More`}
          </Button>
        )}
      </div>
    </div>
  );
};

/* ------------------ PostingDateFilter unchanged ------------------ */
const PostingDateFilter = ({
  filters,
  activeDateRange,
  onSelectDate,
  onDateChange,
}: any) => (
  <div>
    <Label className="text-sm font-semibold text-muted-foreground mb-3 block">
      Posting Date
    </Label>
    <div className="flex flex-col space-y-3">
      <div className="flex flex-wrap gap-2 justify-between">
        {["from", "to"].map((key) => (
          <Popover key={key}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-start rounded-full px-4 text-left font-normal truncate"
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {filters.postingDate[key]
                  ? new Date(filters.postingDate[key]).toLocaleDateString()
                  : key === "from"
                  ? "From"
                  : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={
                  filters.postingDate[key]
                    ? new Date(filters.postingDate[key])
                    : undefined
                }
                onSelect={(date) =>
                  onDateChange({
                    ...filters,
                    postingDate: {
                      ...filters.postingDate,
                      [key]: date ? date.toISOString() : "",
                    },
                  })
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ))}
      </div>
      <div className="flex justify-between gap-2 flex-wrap mt-2">
        {["today", "week", "month"].map((range) => (
          <Button
            key={range}
            variant={activeDateRange === range ? "default" : "outline"}
            size="sm"
            className="rounded-full flex-1"
            onClick={() => onSelectDate(range)}
          >
            {range === "today"
              ? "Today"
              : range === "week"
              ? "This Week"
              : "This Month"}
          </Button>
        ))}
      </div>
    </div>
  </div>
);

export default Internship;
