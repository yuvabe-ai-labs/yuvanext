import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin,
  Clock,
  Bookmark,
  Check,
  Share2,
  ChevronLeft,
  IndianRupee,
  CircleCheckBig,
} from "lucide-react";
import {
  useRemommendedInternships,
  useSaveInternship,
  useRemoveSavedInternship,
  useInternshipShareLink,
} from "@/hooks/useInternships";
import { useInternshipStatus } from "@/hooks/useSavedInternships";
import ProfileSummaryDialog from "@/components/ProfileSummaryDialog";
import ApplicationSuccessDialog from "@/components/ApplicationSuccessDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import type { Internship } from "@/types/internships.types";
import Navbar from "@/components/Navbar";

const RecommendedInternships = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const [selectedInternship, setSelectedInternship] = useState<string>("");
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Fetch data using React Query hooks
  const {
    data: internshipsData,
    isLoading: loading,
    error: fetchError,
  } = useRemommendedInternships();

  // Get saved and applied status for the selected internship
  const {
    isSaved,
    isApplied,
    applicationData,
    isLoading: isCheckingStatus,
    refetchSaved,
    refetchApplied,
  } = useInternshipStatus(selectedInternship || "");

  const { mutate: saveInternshipMutation, isPending: isSaving } =
    useSaveInternship();
  const { mutate: removeSavedInternshipMutation, isPending: isRemoving } =
    useRemoveSavedInternship();
  const { mutate: generateShareLink } = useInternshipShareLink();

  // Process data
  const internships: Internship[] = Array.isArray(internshipsData)
    ? internshipsData
    : [];
  const error = fetchError ? "Failed to fetch internships" : null;

  const savingInternship = isSaving || isRemoving;

  // Set default selected internship when data loads or from URL params
  useEffect(() => {
    const idFromUrl = searchParams.get("id");

    if (idFromUrl && internships.length > 0) {
      const exists = internships.some((int) => int.id === idFromUrl);
      if (exists) {
        setSelectedInternship(idFromUrl);
        return;
      }
    }

    if (internships.length > 0 && !selectedInternship) {
      setSelectedInternship(internships[0].id);
    }
  }, [ searchParams, ]);

  // Scroll to top when internship selection changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedInternship]);

  const selectedInternshipData =
    internships.find((int) => int.id === selectedInternship) || internships[0];

  const handleSaveInternship = async () => {
    if (!selectedInternship) return;

    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save internships.",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      removeSavedInternshipMutation(selectedInternship, {
        onSuccess: () => {
          toast({
            title: "Removed",
            description: "Internship removed from saved list.",
          });
          refetchSaved();
        },
        onError: (error: any) => {
          console.error("Error removing internship:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to remove internship.",
            variant: "destructive",
          });
        },
      });
    } else {
      saveInternshipMutation(selectedInternship, {
        onSuccess: () => {
          toast({
            title: "Saved",
            description: "Internship saved successfully!",
          });
          refetchSaved();
        },
        onError: (error: any) => {
          console.error("Error saving internship:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to save internship.",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleShare = () => {
    if (!selectedInternship) return;

    generateShareLink(selectedInternship, {
      onSuccess: (shareUrl) => {
        setShowShareDialog(true);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to generate share link.",
          variant: "destructive",
        });
      },
    });
  };

  const handleApplicationSuccess = () => {
    refetchApplied();
    setShowSuccessDialog(true);
  };

  // Parse array fields safely
  const parseArray = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data))
      return data.filter((item) => item && typeof item === "string");
    return [];
  };

  const responsibilities = parseArray(selectedInternshipData?.responsibilities);
  const benefits = parseArray(selectedInternshipData?.benefits);
  const skillsRequired = parseArray(selectedInternshipData?.skillsRequired);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container px-4 sm:px-6 lg:px-[5.5rem]">
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:flex-row">
          {/* Left Sidebar - Fixed Header + Scrollable List */}
          <div className="w-full lg:w-80 border-gray-200 h-full flex flex-col overflow-y-auto lg:overflow-y-visible">
            {/* Fixed Top Picks Header */}
            <div className="bg-gradient-to-br hidden md:block from-orange-400 via-orange-500 to-orange-600 text-white p-4 sm:p-5 shadow-sm flex-shrink-0 sticky top-0 z-10">
              <h2 className="text-base sm:text-2xl font-bold">
                Top picks for you
              </h2>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                Based on your profile, preferences, and activity like applies,
                searches, and saves
              </p>
              <p className="text-xs mt-2 opacity-80">
                {loading ? "..." : internships.length} results
              </p>
            </div>

            {/* Scrollable Internship Cards List */}
            <div
              className="overflow-y-auto flex-1 lg:max-h-none"
              style={{ scrollbarWidth: "thin", minHeight: 0 }}
            >
              <div className="flex items-center md:hidden">
                <button onClick={() => window.history.back()} className="p-2">
                  <ChevronLeft size={28} className="text-gray-700" />
                </button>
                <h2 className="text-xl font-semibold">Recommended for you</h2>
              </div>

              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer shadow-sm border border-gray-200 mb-2.5"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-16 h-5 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-2/3 mb-3" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    Error loading internships: {error}
                  </p>
                </div>
              ) : internships.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm">
                    No recommended internships available.
                  </p>
                </div>
              ) : (
                internships.map((internship) => {
                  const createdBy = internship.createdBy;
                  return (
                    <React.Fragment key={internship.id}>
                      {/* Mobile View */}
                      <Card
                        className="block mb-2.5 lg:hidden cursor-pointer transition-all duration-150 shadow-sm border border-orange-600 hover:shadow-md"
                        onClick={() =>
                          navigate(`/internships/${internship.id}`)
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={createdBy?.avatarUrl || undefined}
                                alt={createdBy?.name || "Company"}
                              />
                              <AvatarFallback className="bg-black text-white text-xs font-bold">
                                {createdBy?.name?.charAt(0) || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <Badge className="bg-blue-500 hover:bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              {internship.createdAt
                                ? formatDistanceToNow(
                                    new Date(internship.createdAt),
                                    {
                                      addSuffix: true,
                                    },
                                  )
                                : "recently"}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-tight">
                            {internship.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">
                            {internship.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {internship.duration || "Not specified"}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Desktop View */}
                      <Card
                        className={`hidden lg:block cursor-pointer transition-all duration-150 shadow-sm border lg:border-gray-100 rounded-none hover:shadow-md ${
                          selectedInternship === internship.id
                            ? "ring-1 ring-blue-500 shadow-md border-blue-200"
                            : "hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedInternship(internship.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={createdBy?.avatarUrl || undefined}
                                alt={createdBy?.name || "Company"}
                              />
                              <AvatarFallback className="bg-black text-white text-xs font-bold">
                                {createdBy?.name?.charAt(0) || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <Badge className="bg-blue-500 hover:bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              {internship.createdAt
                                ? formatDistanceToNow(
                                    new Date(internship.createdAt),
                                    {
                                      addSuffix: true,
                                    },
                                  )
                                : "recently"}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-tight">
                            {internship.title}
                          </h3>
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">
                            {internship.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {internship.duration || "Not specified"}
                          </div>
                        </CardContent>
                      </Card>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Content - Independently Scrollable */}
          <div
            ref={contentRef}
            className="hidden lg:flex lg:flex-1 bg-white lg:h-full overflow-y-auto px-4 sm:px-3 lg:px-4 mb-10"
            style={{ scrollbarWidth: "thin" }}
          >
            {loading ? (
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-start space-x-5">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-7 w-64" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-80" />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center py-16">
                <p className="text-gray-500">
                  Error loading internship details: {error}
                </p>
              </div>
            ) : !selectedInternshipData ? (
              <div className="p-8 text-center py-16">
                <p className="text-gray-500">
                  Select an internship to view details
                </p>
              </div>
            ) : (
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start mb-6 sm:mb-8 gap-4">
                  <div className="flex flex-col sm:flex-row flex-1 items-start space-y-4 sm:space-y-0 sm:space-x-5 w-full lg:w-auto">
                    <Avatar className="w-12 h-12 sm:w-16 sm:h-16 shadow-sm flex-shrink-0">
                      <AvatarImage
                        src={
                          selectedInternshipData.createdBy?.avatarUrl ||
                          undefined
                        }
                        alt={
                          selectedInternshipData.createdBy?.name || "Company"
                        }
                      />
                      <AvatarFallback className="bg-teal-600 text-white text-lg sm:text-2xl font-bold">
                        {selectedInternshipData.createdBy?.name?.charAt(0) ||
                          "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-2">
                        <div>
                          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                            {selectedInternshipData.title}
                          </h1>
                          <p className="text-base sm:text-lg text-gray-700 mb-3 font-medium">
                            {selectedInternshipData.createdBy?.name}
                          </p>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={savingInternship || isCheckingStatus}
                            className={`flex items-center px-3 py-2 ${
                              isSaved
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-600 bg-white"
                            }`}
                            onClick={handleSaveInternship}
                          >
                            <Bookmark
                              className={`w-4 h-4 mr-1 ${
                                isSaved ? "fill-current" : ""
                              }`}
                            />
                            <span>{isSaved ? "Saved" : "Save"}</span>
                          </Button>
                          <Button
                            size="sm"
                            className="flex items-center px-3 py-2 text-gray-700 bg-white"
                            onClick={handleShare}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            <span>Share</span>
                          </Button>
                          <Button
                            className="bg-orange-500 hover:bg-orange-600 rounded-full text-white px-6"
                            disabled={isApplied || isCheckingStatus}
                            onClick={() => setShowApplicationDialog(true)}
                          >
                            {isApplied ? "Applied" : "Apply Now"}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5 text-gray-500" />
                          {selectedInternshipData.createdBy?.location ||
                            "Not specified"}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                          {selectedInternshipData.duration || "Not specified"}
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="w-4 h-4 mr-1.5 text-gray-500" />
                          {selectedInternshipData.isPaid ? (
                            <span>
                              Paid{" "}
                              {selectedInternshipData.payment &&
                                `- ${selectedInternshipData.payment}`}
                            </span>
                          ) : (
                            <span>Unpaid</span>
                          )}
                        </div>

                        <div className="flex items-center">
                          {selectedInternshipData.jobType === "full_time"
                            ? "Full Time"
                            : selectedInternshipData.jobType === "part_time"
                              ? "Part Time"
                              : selectedInternshipData.jobType === "both"
                                ? "Full Time & Part Time"
                                : "Not specified"}
                        </div>

                        {selectedInternshipData.minAgeRequired && (
                          <div className="flex items-center">
                            Minimum Age: {selectedInternshipData.minAgeRequired}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Banner - Shows if saved or applied */}
                {(isSaved || isApplied) && (
                  <div className="flex gap-2 mb-6">
                    {isApplied && applicationData && (
                      <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <CircleCheckBig className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Applied on{" "}
                          {new Date(
                            applicationData.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* About the Internship */}
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    About the Internship
                  </h2>
                  <div className="text-gray-700 leading-relaxed">
                    <p>{selectedInternshipData.description}</p>
                  </div>
                </div>

                {/* Key Responsibilities */}
                {responsibilities.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      Key Responsibilities
                    </h2>
                    <div className="space-y-3">
                      {responsibilities.map((responsibility, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {responsibility}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {benefits.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      Benefits
                    </h2>
                    <div className="space-y-3">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {benefit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Required */}
                {skillsRequired.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      Skills Required
                    </h2>
                    <div className="space-y-3">
                      {skillsRequired.map((skill, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {skill}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {selectedInternshipData.closingDate && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Application Deadline
                      </h3>
                      <p className="text-gray-700 mb-10">
                        {new Date(
                          selectedInternshipData.closingDate,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {selectedInternshipData.createdBy?.phone && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Contact
                      </h3>
                      <p className="text-gray-700">
                        {selectedInternshipData.createdBy.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Dialog */}
      {selectedInternshipData && (
        <ProfileSummaryDialog
          isOpen={showApplicationDialog}
          onClose={() => setShowApplicationDialog(false)}
          internship={selectedInternshipData}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Success Dialog */}
      <ApplicationSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
      />

      {/* Share Dialog */}
      {selectedInternshipData && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          title={selectedInternshipData.title}
          url={`${window.location.origin}/internships/${selectedInternshipData.id}`}
        />
      )}
    </div>
  );
};

export default RecommendedInternships;
