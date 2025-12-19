import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Star,
  Heart,
  XCircle,
  User,
  CopyCheck,
  Ban,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Youtube,
  Palette,
  Dribbble,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useCandidateProfile } from "@/hooks/useCandidateProfile";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRef, useState } from "react";
import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";

const safeParse = (data: any, fallback: any) => {
  if (!data) return fallback;
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

const CandidateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, loading, error, refetch } = useCandidateProfile(id || "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  type StatusType =
    | "applied"
    | "shortlisted"
    | "rejected"
    | "interviewed"
    | "hired";

  const statusOptions: { value: StatusType; label: string; icon: any }[] = [
    { value: "shortlisted", label: "Shortlisted", icon: Heart },
    { value: "applied", label: "Not Shortlisted", icon: Ban },
    { value: "rejected", label: "Not Selected", icon: XCircle },
    { value: "hired", label: "Select Candidate", icon: CopyCheck },
    { value: "interviewed", label: "Schedule Interview", icon: User },
  ];

  const [pendingStatus, setPendingStatus] = useState<
    "applied" | "shortlisted" | "rejected" | "interviewed" | "hired" | null
  >(null);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      applied: "Not Shortlisted",
      shortlisted: "Shortlisted",
      rejected: "Not Shortlisted",
      interviewed: "Schedule Interview",
      hired: "Select Candidate",
    };
    return statusMap[status] || status;
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-500 text-white";
      case "interviewed":
        return "bg-yellow-500 text-white";
      case "applied":
        return "bg-white text-gray-700 border border-gray-300";
      case "rejected":
        return "bg-red-500 text-white";
      case "hired":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getDialogContent = (status: string) => {
    switch (status) {
      case "shortlisted":
        return {
          title: "Shortlist Candidate?",
          description: `Are you sure you want to shortlist ${data?.profile.full_name}? This will move them to the next stage of the hiring process.`,
          icon: <Heart className="w-6 h-6 text-green-500" />,
        };
      case "applied":
        return {
          title: "Not Shortlist Candidate?",
          description: `Are you sure you want to mark ${data?.profile.full_name} as not shortlisted? You can change this status later if needed.`,
          icon: <Ban className="w-6 h-6 text-red-500" />,
        };
      case "hired":
        return {
          title: "Select Candidate?",
          description: `Are you sure you want to select ${data?.profile.full_name} for this position? This will mark them as hired.`,
          icon: <CopyCheck className="w-6 h-6 text-blue-500" />,
        };
      default:
        return {
          title: "Update Status?",
          description: `Are you sure you want to update the status for ${data?.profile.full_name}?`,
          icon: <User className="w-6 h-6" />,
        };
    }
  };

  const handleStatusChange = async (
    newStatus: "applied" | "shortlisted" | "rejected" | "interviewed" | "hired"
  ) => {
    if (!data?.application.id) return;

    // If status is "interviewed", open the schedule dialog instead
    if (newStatus === "interviewed") {
      setShowScheduleDialog(true);
      return;
    }

    // Store pending status and show confirmation dialog
    setPendingStatus(newStatus);
    setShowConfirmDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!data?.application.id || !pendingStatus) return;

    setIsUpdatingStatus(true);
    setShowConfirmDialog(false);

    try {
      const res = await supabase
        .from("applications")
        .update({ status: pendingStatus })
        .eq("id", data.application.id);
      await supabase.functions.invoke("update-application-status", {
        body: JSON.stringify({
          applicationId: data.application.id,
          action: pendingStatus,
          candidateEmail: data.profile.email,
          candidateName: data.profile.full_name,
        }),
      });

      console.log();

      if (res.error) console.log();

      // Refresh the data
      await refetch();

      // Show success toast
      toast({
        title: "Status Updated",
        description: `Application status changed to ${getStatusLabel(
          pendingStatus
        )}`,
        duration: 3000,
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Update Failed",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUpdatingStatus(false);
      setPendingStatus(null);
    }
  };

  const handleCancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingStatus(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Candidate Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The candidate profile could not be found."}
          </p>
          <Button onClick={() => navigate("/unit-dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const skills = safeParse(data.studentProfile.skills, []);
  const interests = safeParse(data.studentProfile.interests, []);
  const achievements = safeParse(data.studentProfile.achievements, []);
  const projects = safeParse(data.studentProfile.projects, []);
  const internships = safeParse(data.studentProfile.internships, []);
  const courses = safeParse(data.studentProfile.completed_courses, []);
  const education = safeParse(data.studentProfile.education, []);
  const links = safeParse(data.studentProfile.links, []);

  const matchScore = data.application.profile_match_score || 0;

  const dialogContent = pendingStatus ? getDialogContent(pendingStatus) : null;

  const handleGeneratePDF = async () => {
    if (!profileRef.current) return;

    const element = profileRef.current;

    const canvas = await html2canvas(element, {
      scale: 1.2,
      useCORS: true, // Required for avatar
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 2.8);
    // JPEG + compression drastically reduces size

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(
      imgData,
      "JPEG",
      0,
      position,
      pdfWidth,
      imgHeight,
      undefined,
      "FAST"
    );
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        pdfWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`${data.profile.full_name}-Profile.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/unit-dashboard")}
            className="gap-2 flex items-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Center Title */}
          <h1 className="text-2xl font-bold text-center flex-1">
            Applied for "{data.internship.title}"
          </h1>

          {/* Profile Match Section */}
          <div className="flex items-center gap-2">
            <span className="text-l font-medium">Profile Match</span>
            <div className="relative w-10 h-10">
              <svg className="transform -rotate-90 w-10 h-10">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${matchScore * 1.005} 100.5`}
                  className="text-green-500"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {matchScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="container mx-auto px-2 py-2" ref={profileRef}>
          <Card className="mb-4 rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={data.studentProfile.avatar_url || undefined}
                    alt={data.profile.full_name}
                  />
                  <AvatarFallback className="text-2xl">
                    {data.profile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    {data.profile.full_name}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {typeof data.studentProfile.bio === "string"
                      ? data.studentProfile.bio
                      : Array.isArray(data.studentProfile.bio)
                      ? data.studentProfile.bio.join(" ")
                      : "Passionate professional with experience creating meaningful impact."}
                  </p>

                  <div className="flex flex-row gap-4 text-sm text-muted-foreground mb-6">
                    {data.profile.email && (
                      <div className="flex items-center gap-2 leading-none">
                        <Mail className="w-4 h-4" />
                        <span>{data.profile.email}</span>
                      </div>
                    )}
                    {data.profile.phone && (
                      <div className="flex items-center gap-2 leading-none">
                        <Phone className="w-4 h-4" />
                        <span>{data.profile.phone}</span>
                      </div>
                    )}
                    {data.studentProfile.location && (
                      <div className="flex items-center gap-2 leading-none">
                        <MapPin className="w-4 h-4" />
                        <span>{data.studentProfile.location}</span>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-3 `}>
                    <Button
                      onClick={handleGeneratePDF}
                      disabled={isLoading}
                      className="no-pdf w-52 rounded-full px-3 py-1.5 text-sm text-white transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#07636C] to-[#0694A2] hover:opacity-90"
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              strokeOpacity="0.25"
                            ></circle>
                            <path
                              d="M12 2a10 10 0 0 1 10 10"
                              strokeOpacity="0.75"
                            ></path>
                          </svg>
                          Loading...
                        </>
                      ) : isDownloaded ? (
                        <>
                          <Check className="w-4 h-4" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Profile
                        </>
                      )}
                    </Button>

                    <Select
                      value={
                        data.application.status === "applied"
                          ? ""
                          : data.application.status
                      }
                      onValueChange={handleStatusChange}
                      disabled={isUpdatingStatus}
                    >
                      {/* Trigger with dynamic background */}
                      <SelectTrigger
                        className={`w-52 rounded-full px-3 py-1.5 text-sm ${getStatusBg(
                          data.application.status
                        )}`}
                      >
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>

                      {/* Dropdown content */}
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="shortlisted">
                          <div className="flex items-center gap-1.5 px-3 py-1">
                            <Heart className="w-4 h-4" />
                            Shortlisted
                          </div>
                        </SelectItem>

                        <SelectItem value="rejected">
                          <div className="flex items-center gap-1.5 px-3 py-1">
                            <Ban className="w-4 h-4" />
                            Not Shortlisted
                          </div>
                        </SelectItem>

                        <SelectItem value="hired">
                          <div className="flex items-center gap-1.5 px-3 py-1">
                            <CopyCheck className="w-4 h-4" />
                            Select Candidate
                          </div>
                        </SelectItem>

                        <SelectItem value="interviewed">
                          <div className="flex items-center gap-1.5 px-3 py-1">
                            <User className="w-4 h-4" />
                            Schedule Interview
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[30%_69%] gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Skills & Expertise */}
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-6">
                    Skills & Expertise
                  </h3>
                  <div className="space-y-4">
                    {skills.length > 0 ? (
                      skills.map((skill: any, idx: number) => {
                        const skillName =
                          typeof skill === "string" ? skill : skill.name;
                        const skillLevel =
                          typeof skill === "object"
                            ? skill.level
                            : "Intermediate";
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                          >
                            <span className="font-medium">{skillName}</span>
                            {/* <Badge variant="secondary" className="bg-muted">
                              {skillLevel}
                            </Badge> */}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills listed
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Internships */}
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Internships</h3>
                  {internships.length > 0 ? (
                    <ul className="space-y-4">
                      {internships.map((internship: any) => (
                        <li key={internship.id} className="text-base">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-lg">
                              {internship.title}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {internship.is_current
                                ? "Ongoing"
                                : `${new Date(
                                    internship.start_date
                                  ).toLocaleDateString()} - ${
                                    internship.end_date
                                      ? new Date(
                                          internship.end_date
                                        ).toLocaleDateString()
                                      : "N/A"
                                  }`}
                            </span>
                          </div>

                          <p className="text-muted-foreground text-base mt-1">
                            Company:{" "}
                            <span className="font-medium text-foreground">
                              {internship.company || "—"}
                            </span>
                          </p>

                          {internship.description ? (
                            <p className="text-muted-foreground text-[15px] leading-relaxed mt-1">
                              {internship.description}
                            </p>
                          ) : (
                            <span className="italic text-muted-foreground text-sm">
                              No description available
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-base text-muted-foreground">
                      No internships listed
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Interests */}
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.length > 0 ? (
                      interests.map((interest: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No interests listed
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Completed Courses */}
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Completed Courses</h3>
                  {courses.length > 0 ? (
                    <ul className="space-y-4">
                      {courses.map((course: any) => (
                        <li key={course.id} className="text-base">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-lg">
                              {course.title}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {course.completion_date
                                ? new Date(
                                    course.completion_date
                                  ).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-base mt-1">
                            Provider:{" "}
                            <span className="font-medium">
                              {course.provider}
                            </span>
                          </p>
                          {course.certificate_url ? (
                            <a
                              href={course.certificate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-base"
                            >
                              View Certificate
                            </a>
                          ) : (
                            <span className="italic text-muted-foreground text-sm">
                              No certificate available
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-base text-muted-foreground">
                      No completed courses listed
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Projects */}
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Projects</h3>
                  {projects.length > 0 ? (
                    <ul className="space-y-4">
                      {projects.map((project: any) => (
                        <li key={project.id} className="text-base">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-lg">
                              {project.title}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {project.is_current
                                ? "Ongoing"
                                : `${new Date(
                                    project.start_date
                                  ).toLocaleDateString()} - ${new Date(
                                    project.end_date
                                  ).toLocaleDateString()}`}
                            </span>
                          </div>

                          {project.description && (
                            <p className="text-muted-foreground text-[15px] leading-relaxed mt-1">
                              {project.description}
                            </p>
                          )}

                          {project.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.technologies.map(
                                (tech: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-muted px-2 py-1 rounded-full"
                                  >
                                    {tech}
                                  </span>
                                )
                              )}
                            </div>
                          )}

                          {project.project_url ? (
                            <a
                              href={project.project_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-base mt-1 block"
                            >
                              View Project
                            </a>
                          ) : (
                            <span className="italic text-muted-foreground text-sm mt-1 block">
                              No project link available
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-base text-muted-foreground">
                      No projects listed
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-6">Education</h3>
                  {education.length > 0 ? (
                    <div className="space-y-5">
                      {education.map((edu: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between pb-4 border-b last:border-0"
                        >
                          <div>
                            <h4 className="font-semibold text-lg">
                              {edu.degree || edu.name || "Education"}
                            </h4>
                            <p className="text-base text-muted-foreground">
                              {edu.institution ||
                                edu.school ||
                                edu.college ||
                                "Educational Institution"}
                            </p>
                            {edu.field_of_study && (
                              <p className="text-base text-muted-foreground mt-1">
                                {edu.field_of_study}
                              </p>
                            )}
                            {edu.description && (
                              <p className="text-base mt-2 leading-relaxed">
                                {edu.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-base font-medium">
                              {edu.start_year || edu.start_date} -{" "}
                              {edu.end_year || edu.end_date || "Present"}
                            </p>
                            {edu.score && (
                              <p className="text-base text-primary font-semibold">
                                {edu.score}
                              </p>
                            )}
                            {edu.grade && (
                              <p className="text-base text-primary font-semibold">
                                {edu.grade}
                              </p>
                            )}
                            {edu.gpa && (
                              <p className="text-base text-primary font-semibold">
                                GPA: {edu.gpa}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base text-muted-foreground">
                      No education records
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Links */}
              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Links</h3>

                  <div className="flex flex-wrap gap-3 items-center">
                    {(() => {
                      const getSocialIcon = (link: any) => {
                        const url = (link.url || "").toLowerCase();
                        const platform = (link.platform || "").toLowerCase();

                        if (
                          platform.includes("linkedin") ||
                          url.includes("linkedin.com")
                        )
                          return Linkedin;
                        if (
                          platform.includes("instagram") ||
                          url.includes("instagram.com")
                        )
                          return Instagram;
                        if (
                          platform.includes("facebook") ||
                          url.includes("facebook.com")
                        )
                          return Facebook;
                        if (
                          platform.includes("twitter") ||
                          platform.includes("x") ||
                          url.includes("twitter.com") ||
                          url.includes("x.com")
                        )
                          return Twitter;
                        if (
                          platform.includes("youtube") ||
                          url.includes("youtube.com")
                        )
                          return Youtube;
                        if (
                          platform.includes("behance") ||
                          url.includes("behance.net")
                        )
                          return Palette;
                        if (
                          platform.includes("dribbble") ||
                          url.includes("dribbble.com")
                        )
                          return Dribbble;
                        return Globe;
                      };

                      if (!links || links.length === 0) {
                        return (
                          <p className="text-sm text-muted-foreground">
                            No links provided
                          </p>
                        );
                      }

                      return (
                        <div className="flex flex-wrap gap-3">
                          {links.map((link: any, idx: number) => {
                            const Icon = getSocialIcon(link);
                            return (
                              <Button
                                key={idx}
                                variant="outline"
                                size="icon"
                                className="rounded-full"
                                asChild
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Icon className="w-4 h-4" />
                                </a>
                              </Button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Status Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {dialogContent?.icon}
              <AlertDialogTitle className="text-xl">
                {dialogContent?.title}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              {dialogContent?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelStatusChange}
              className="rounded-full"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              className={`rounded-full ${
                pendingStatus === "shortlisted"
                  ? "bg-green-500 hover:bg-green-600"
                  : pendingStatus === "applied"
                  ? "bg-red-500 hover:bg-red-600"
                  : pendingStatus === "hired"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : ""
              }`}
            >
              {isUpdatingStatus ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Interview Dialog */}
      <ScheduleInterviewDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        candidateName={data.profile.full_name}
        candidateEmail={data.profile.email}
        applicationId={data.application.id}
        onSuccess={refetch}
        candidateProfileId={data.profile.id}
      />
    </div>
  );
};

export default CandidateProfile;
