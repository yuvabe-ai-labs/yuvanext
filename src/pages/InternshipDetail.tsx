import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  CircleCheckBig,
  ChevronLeft,
  IndianRupee,
} from "lucide-react";
import { ShareDialog } from "@/components/ShareDialog";
import Navbar from "@/components/Navbar";
import ProfileSummaryDialog from "@/components/ProfileSummaryDialog";
import ApplicationSuccessDialog from "@/components/ApplicationSuccessDialog";
import { useSession } from "@/lib/auth-client";
import { useIsSaved } from "@/hooks/useSavedInternships";
import {
  useInternshipById,
  useSaveInternship,
  useRemoveSavedInternship,
  useAppliedInternshipStatus,
} from "@/hooks/useInternships";
import { useToast } from "@/hooks/use-toast";
import { PayIcon } from "@/components/ui/custom-icons";

const InternshipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = useSession();

  // Fetch internship data
  const { data: internship, isLoading, error } = useInternshipById(id || "");

  // Mutations for save/unsave
  const { mutate: saveInternship, isPending: isSaving } = useSaveInternship();
  const { mutate: removeSavedInternship, isPending: isRemoving } =
    useRemoveSavedInternship();

  // Get applied internship status
  const {
    data: appliedStatus,
    isLoading: isLoadingStatus,
    refetch: refetchAppliedStatus,
  } = useAppliedInternshipStatus();

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Check if the current internship has been applied to
  const hasApplied = appliedStatus?.id === id;

  const {
    isSaved,
    isLoading: isCheckingSaved,
    refetch: refetchSaved,
  } = useIsSaved(id || "");

  const savingInternship = isSaving || isRemoving;

  const handleSaveInternship = async () => {
    if (!id) return;

    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save internships.",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      removeSavedInternship(id, {
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
      saveInternship(id, {
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

  const handleApplicationSuccess = () => {
    refetchAppliedStatus();
    setShowSuccessDialog(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* <Navbar /> */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-background">
        {/* <Navbar /> */}
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Internship Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error
              ? error.message
              : "The internship you are looking for does not exist."}
          </p>
          <Button onClick={() => navigate("/internships")}>
            Back to Internships
          </Button>
        </div>
      </div>
    );
  }

  const unit = internship.createdBy;
  const responsibilities = internship.responsibilities || [];
  const requirements = internship.skillsRequired || [];
  const benefits = internship.benefits || [];
  const skillsRequired = internship.skillsRequired || [];

  return (
    <div className="min-h-screen bg-background">
      {/* <Navbar /> */}

      {/* Main Content */}
      <div className="container px-4 py-4 md:px-8 lg:px-[7.5rem] lg:py-10 overflow-hidden">
        {/* Mobile Header */}
        <div className="flex pt-4 lg:hidden items-center justify-between pb-1 border-b border-none border-gray-200 gap-2 w-full">
          {/* Back Button */}
          <button onClick={() => window.history.back()} className="p-2">
            <ChevronLeft size={28} className="text-gray-700" />
          </button>

          {/* Save & Share Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveInternship}
              disabled={savingInternship || isCheckingSaved}
              className="p-2"
            >
              <Bookmark
                size={22}
                className={`${
                  isSaved ? "text-teal-500 fill-teal-500" : "text-gray-700"
                }`}
              />
            </button>

            <button onClick={() => setShowShareDialog(true)} className="p-2">
              <Share2 size={22} className="text-gray-700" />
            </button>
            <Button
              variant="gradient"
              className="rounded-full text-white"
              disabled={hasApplied || isLoadingStatus}
              onClick={() => setShowApplicationDialog(true)}
            >
              {hasApplied ? "Applied" : "Apply Now"}
            </Button>
          </div>
        </div>

        <div className="space-y-8 rounded-3xl  border-0 md:border md:border-gray-200 p-2 md:p-10 lg:p-14">
          {/* Header Card */}
          <Card className="mb-6  border-0 first-line:shadow-none">
            <CardContent className="border-0 p-0">
              <div className="flex lg:hidden flex-col gap-4 pb-7 border-b border-gray-200">
                {/* Avatar + title + company */}
                <div className="flex gap-4 items-start">
                  {/* Avatar */}
                  <div
                    className={`${
                      unit?.avatarUrl
                        ? "bg-transparent border border-gray-200"
                        : "bg-gradient-to-br from-teal-400 to-teal-600"
                    } w-[4rem] h-[4rem] rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    {unit?.avatarUrl ? (
                      <img
                        src={unit.avatarUrl}
                        alt={unit.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl text-white font-bold">
                        {unit?.name?.charAt(0) || "C"}
                      </span>
                    )}
                  </div>

                  {/* Title and info */}
                  <div className="flex-1">
                    <h1 className="text-lg font-bold leading-tight">
                      {internship.title}
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">
                      {unit?.name}
                    </p>

                    {/* icons (location, duration, paid) */}
                    <div className="flex flex-wrap gap-3 text-xs mt-1">
                      {unit?.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{unit.location}</span>
                        </div>
                      )}
                      {internship.duration && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{internship.duration}</span>
                        </div>
                      )}
                      {internship.isPaid ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <IndianRupee className="w-4 h-4" />
                          <span>
                            Paid{" "}
                            {internship.payment && `- ${internship.payment}`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <IndianRupee className="w-4 h-4" />
                          <span>Unpaid</span>
                        </div>
                      )}

                      <div className="flex items-center text-muted-foreground">
                        {internship.jobType === "full_time"
                          ? "Full Time"
                          : internship.jobType === "part_time"
                          ? "Part Time"
                          : internship.jobType === "both"
                          ? "Full Time & Part Time"
                          : "Not specified"}
                      </div>

                      {/* Minimum Age */}
                      {internship.minAgeRequired && (
                        <div className="flex items-center text-muted-foreground">
                          Minimum Age: {internship.minAgeRequired}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex items-start justify-between pb-7 border-b border-gray-200 gap-6">
                {/* Left Side - Company Logo & Info */}
                <div className="flex gap-7 flex-1">
                  <div
                    className={`${
                      unit?.avatarUrl
                        ? "bg-transparent border border-gray-200"
                        : "bg-gradient-to-br from-teal-400 to-teal-600"
                    } w-[6.25rem] h-[6.25rem] rounded-full  flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-3xl text-white font-bold">
                      {unit?.avatarUrl ? (
                        <img
                          src={unit.avatarUrl}
                          alt={unit.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl text-white font-bold">
                          {unit?.name?.charAt(0) || "C"}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold">{internship.title}</h1>
                    <p className="text-lg text-muted-foreground font-medium mb-2.5">
                      {unit?.name}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      {unit?.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{unit.location}</span>
                        </div>
                      )}
                      {internship.duration && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{internship.duration}</span>
                        </div>
                      )}

                      {internship.isPaid ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <IndianRupee className="w-4 h-4" />
                          <span>
                            Paid{" "}
                            {internship.payment && `- ${internship.payment}`}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <IndianRupee className="w-4 h-4" />
                          <span>Unpaid</span>
                        </div>
                      )}

                      <div className="flex items-center text-muted-foreground">
                        {internship.jobType === "full_time"
                          ? "Full Time"
                          : internship.jobType === "part_time"
                          ? "Part Time"
                          : internship.jobType === "both"
                          ? "Full Time & Part Time"
                          : "Not specified"}
                      </div>

                      {/* Minimum Age */}
                      {internship.minAgeRequired && (
                        <div className="flex items-center text-muted-foreground">
                          Minimum Age: {internship.minAgeRequired}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Action Buttons */}
                <div className="lg:flex gap-2 hidden items-start">
                  <Button
                    size="sm"
                    className={`flex items-center ${
                      isSaved
                        ? "text-gray-400 bg-white"
                        : "text-gray-600 bg-white"
                    }`}
                    onClick={handleSaveInternship}
                    disabled={savingInternship || isCheckingSaved}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                    />
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </Button>
                  <Button
                    size="sm"
                    className="flex items-center text-gray-700 bg-white"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </Button>
                  <Button
                    variant="gradient"
                    className="rounded-full text-white"
                    disabled={hasApplied || isLoadingStatus}
                    onClick={() => setShowApplicationDialog(true)}
                  >
                    {hasApplied ? "Applied" : "Apply Now"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* About the Internship */}
          <div className="lg:hidden border-b border-gray-200 pb-7">
            {unit?.description && (
              <section>
                <h2 className="text-xl font-medium my-4">About the company</h2>
                <div className="flex flex-wrap gap-2">
                  <p className="text-muted-foreground text-justify leading-relaxed">
                    {unit.description}
                  </p>
                </div>
                <div className="py-4">
                  <Button
                    variant="gradient"
                    className="border-none  bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8"
                    onClick={() => {
                      if (unit.userId) {
                        navigate(`/units/${unit.userId}`);
                      } else {
                        toast({
                          title: "Not Available",
                          description: "Company profile not found.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    View Company
                  </Button>
                </div>
              </section>
            )}
          </div>
          <section className="border-b border-gray-200 pb-7">
            <h2 className="text-xl font-medium mb-4">About the Internship</h2>
            <p className="text-muted-foreground leading-relaxed text-justify">
              {internship.description || "No description available."}
            </p>
          </section>

          {/* Key Responsibilities */}
          {responsibilities.length > 0 && (
            <section className="border-b border-gray-200 pb-7">
              <h2 className="text-xl font-medium mb-4">Key Responsibilities</h2>
              <ul className="space-y-3">
                {responsibilities.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CircleCheckBig className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Requirements from the Candidates */}
          {requirements.length > 0 && (
            <section className="border-b border-gray-200 pb-7">
              <h2 className="text-xl font-medium mb-4">
                Requirements from the Candidates
              </h2>
              <ul className="space-y-3">
                {requirements.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CircleCheckBig className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* What You Will Get */}
          {benefits.length > 0 && (
            <section className="border-b border-gray-200 pb-7">
              <h2 className="text-xl font-medium mb-4">What You Will Get</h2>
              <ul className="space-y-3">
                {benefits.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CircleCheckBig className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Required Skills */}
          {skillsRequired.length > 0 && (
            <section className="p-2 border-b border-gray-200 lg:border-0">
              <h2 className="text-xl font-medium mb-4">Required Skills</h2>
              <ul className="space-y-3">
                {skillsRequired.map((skill: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CircleCheckBig className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{skill}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Ready to Apply */}
        <section className="border-b border-gray-200 lg:border-0">
          <div className="my-2.5 rounded-3xl border-0 lg:border lg:border-gray-200 p-2 lg:p-10">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl text-gray-900 font-bold mb-3 lg:mb-5">
                      Ready to Apply
                    </h2>
                    <p className="text-muted-foreground">
                      Join {unit?.name} and make a meaningful impact in{" "}
                      {unit?.location || "Auroville"}
                    </p>
                  </div>

                  {/* Button */}
                  <Button
                    variant="gradient"
                    className="text-white rounded-full "
                    disabled={hasApplied || isLoadingStatus}
                    onClick={() => setShowApplicationDialog(true)}
                  >
                    {hasApplied ? "Applied" : "Apply Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Company Info */}
        <div className="mt-2.5 rounded-3xl hidden lg:block border border-gray-200 p-10">
          <Card className="border-0 shadow-none pb-7 border-b border-gray-200">
            <CardContent className="p-0">
              <div className="flex gap-6 flex-1">
                <div
                  className={`${
                    unit?.avatarUrl
                      ? "bg-transparent border border-gray-200"
                      : "bg-gradient-to-br from-teal-400 to-teal-600"
                  } w-[6.25rem] h-[6.25rem] rounded-full  flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-3xl text-white font-bold">
                    {unit?.avatarUrl ? (
                      <img
                        src={unit.avatarUrl}
                        alt={unit.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-white font-bold">
                        {unit?.name?.charAt(0) || "C"}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex-1">
                  {unit?.phone && (
                    <div>
                      <h2 className="text-2xl font-bold">{unit.name}</h2>
                      <p className="font-[500] text-gray-500">{unit.phone}</p>
                    </div>
                  )}

                  {unit?.address && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{unit.address}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="gradient"
                  className="border-none bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8"
                  onClick={() => {
                    if (unit?.userId) {
                      navigate(`/units/${unit.userId}`);
                    } else {
                      toast({
                        title: "Not Available",
                        description: "Company profile not found.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  View Company Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About Company */}
          {unit?.description && (
            <section>
              <h2 className="text-xl font-medium my-4">About the company</h2>
              <div className="flex flex-wrap gap-2">
                <p className="text-muted-foreground text-justify leading-relaxed">
                  {unit.description}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Application Dialog */}
      {internship && (
        <ProfileSummaryDialog
          isOpen={showApplicationDialog}
          onClose={() => setShowApplicationDialog(false)}
          internship={internship}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Success Dialog */}
      <ApplicationSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
      />

      {/* Share Dialog */}
      {internship && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          title={internship.title}
          url={window.location.href}
        />
      )}
    </div>
  );
};

export default InternshipDetail;
