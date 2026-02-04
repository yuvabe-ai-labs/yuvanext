import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FilterIcon from "@/assets/filter.svg";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, CalendarIcon, Search, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useUnit } from "@/hooks/useUnits";
import { useSession } from "@/lib/auth-client";
import { formatDistanceToNow } from "date-fns";
import type { Unit } from "@/types/units.types";

const Units = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { data: unitsData, isLoading, error } = useUnit();

  // Convert the data to array format
  const units: Unit[] = unitsData || [];

  const [filters, setFilters] = useState({
    units: [] as string[],
    industries: [] as string[],
    departments: [] as string[],
    interestAreas: [] as string[],
    postingDate: { from: "", to: "" },
  });

  const [activeDateRange, setActiveDateRange] = useState("");
  const [searchUnits, setSearchUnits] = useState("");
  const [searchIndustries, setSearchIndustries] = useState("");
  const [searchDepartments, setSearchDepartments] = useState("");
  const [showAllUnits, setShowAllUnits] = useState(false);
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [showAllDepartments, setShowAllDepartments] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const resetFilters = () => {
    setFilters({
      units: [],
      industries: [],
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
      .replace(/\+00:00?|Z$/i, "Z");
    if (!/[zZ]|[+\-]\d{2}:?\d{2}$/.test(s)) s = s + "Z";
    return new Date(s);
  };

  const uniqueUnits = [
    ...new Set(units.map((u) => u.name).filter(Boolean)),
  ] as string[];

  const uniqueIndustries = [
    ...new Set(units.map((u) => u.industry).filter(Boolean)),
  ] as string[];

  const uniqueDepartments = [
    ...new Set(units.flatMap((u) => u.skillsOffered || []).filter(Boolean)),
  ] as string[];

  const interestAreas = [
    ...new Set(units.flatMap((u) => u.focusAreas || [])),
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

  const filteredUnits = units.filter((unit) => {
    if (filters.units.length && !filters.units.includes(unit.name || ""))
      return false;

    if (filters.industries.length) {
      const ind = unit.industry;
      if (!ind || !filters.industries.includes(ind)) return false;
    }

    if (
      filters.departments.length &&
      !filters.departments.some((skill) =>
        Array.isArray(unit.skillsOffered)
          ? unit.skillsOffered.includes(skill)
          : false
      )
    )
      return false;

    if (filters.interestAreas.length) {
      const areas = unit.focusAreas || [];
      if (!filters.interestAreas.some((a) => areas.includes(a))) return false;
    }

    if (filters.postingDate.from || filters.postingDate.to) {
      const unitDate = parsePgTimestamp(unit.createdAt).getTime();
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

  const getUnitGradient = (i: number) => {
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
      <Navbar />
      <div className="container px-4 lg:px-[7.5rem] lg:py-10">
        <div className="flex gap-5">
          {/* Sidebar Filters */}
          <div className="hidden w-80 bg-card pt-5 border border-gray-200 rounded-3xl lg:flex flex-col h-[90vh] sticky top-6">
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
                selected={filters.units}
                onToggle={(v) => toggleFilter("units", v)}
                showAll={showAllUnits}
                setShowAll={setShowAllUnits}
              />
              <FilterSection
                label="Industry"
                searchValue={searchIndustries}
                onSearch={setSearchIndustries}
                list={uniqueIndustries}
                selected={filters.industries}
                onToggle={(v) => toggleFilter("industries", v)}
                showAll={showAllIndustries}
                setShowAll={setShowAllIndustries}
              />
              <FilterSection
                label="Department"
                searchValue={searchDepartments}
                onSearch={setSearchDepartments}
                list={uniqueDepartments}
                selected={filters.departments}
                onToggle={(v) => toggleFilter("departments", v)}
                showAll={showAllDepartments}
                setShowAll={setShowAllDepartments}
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
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                onClick={() => setShowMobileFilters(false)}
              />

              {/* Slide-in Panel */}
              <div
                className="md:hidden fixed top-0 left-0 h-full w-[75%] bg-white z-50
                    p-4 overflow-y-auto shadow-xl space-y-8"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button
                    className="text-primary text-xl"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Unit Providers */}
                <FilterSection
                  label="Units"
                  searchValue={searchUnits}
                  onSearch={setSearchUnits}
                  list={uniqueUnits}
                  selected={filters.units}
                  onToggle={(v) => toggleFilter("units", v)}
                  showAll={showAllUnits}
                  setShowAll={setShowAllUnits}
                />
                <FilterSection
                  label="Industry"
                  searchValue={searchIndustries}
                  onSearch={setSearchIndustries}
                  list={uniqueIndustries}
                  selected={filters.industries}
                  onToggle={(v) => toggleFilter("industries", v)}
                  showAll={showAllIndustries}
                  setShowAll={setShowAllIndustries}
                />
                <FilterSection
                  label="Department"
                  searchValue={searchDepartments}
                  onSearch={setSearchDepartments}
                  list={uniqueDepartments}
                  selected={filters.departments}
                  onToggle={(v) => toggleFilter("departments", v)}
                  showAll={showAllDepartments}
                  setShowAll={setShowAllDepartments}
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

          {/* Main content */}
          <div className="flex-1 w-full">
            <div className="flex pt-4 items-center justify-between mb-4 lg:hidden w-full">
              {/* Left group: Back + Title */}
              <div className="flex items-center gap-2">
                <button
                  className="text-gray-500 text-xl"
                  onClick={() => window.history.back()}
                >
                  <ChevronLeft size={28} strokeWidth={2} />
                </button>

                <h1 className="text-lg font-bold text-gray-600">
                  Explore {filteredUnits.length} Unit
                  {filteredUnits.length !== 1 ? "s" : ""}
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
                Explore {filteredUnits.length} Units
              </h1>
            </div>

            {error ? (
              <p className="text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Failed to load units"}
              </p>
            ) : isLoading ? (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-3xl">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No units found matching your filters.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
                {filteredUnits.map((unit, index) => {
                  const gradient = getUnitGradient(index);

                  return (
                    <Card
                      key={unit.userId}
                      className="relative overflow-hidden rounded-[20px] border border-[#C94100] bg-white shadow-sm transition-all duration-300 hover:shadow-md w-[256px] h-[300px] p-1.5"
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
                            unit.name?.charAt(0) || "C"
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
                            View Openings
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* FilterSection Component */
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

      {/* Single Search Input */}
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

      {/* Search Dropdown */}
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

      {/* Always visible checkbox list */}
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

/* PostingDateFilter Component */
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

export default Units;
