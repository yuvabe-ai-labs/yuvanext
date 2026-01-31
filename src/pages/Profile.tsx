import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import {
  Mail,
  Phone,
  MapPin,
  Trash2,
  Pen,
  Camera,
  CircleCheckBig,
  CircleX,
} from "lucide-react";
import { useState } from "react";
import { PersonalDetailsDialog } from "@/components/profile/PersonalDetailsDialog";
import { SkillsDialog } from "@/components/profile/SkillsDialog";
import { EducationDialog } from "@/components/profile/EducationDialog";
import { ProjectDialog } from "@/components/profile/ProjectDialog";
import { CourseDialog } from "@/components/profile/CourseDialog";
import { InterestDialog } from "@/components/profile/InterestDialog";
import { InternshipDialog } from "@/components/profile/InternshipDialog";
import { ProfileSummaryDialog } from "@/components/profile/ProfileSummaryDialog";
import { format, formatDistanceToNow } from "date-fns";
import { CircularProgress } from "@/components/CircularProgress";
import AIEditIcon from "@/components/ui/custom-icons";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { UnitSocialLinksDialog } from "@/components/unit/UnitSocialLinksDialog";
import {
  Language,
  CandidateEducation,
  CandidateCourse,
  CandidateInternship,
  CandidateProject,
  Link,
} from "@/types/profiles.types";
import { ImageUploadDialog } from "@/components/ImageUploadDialog";
import { useAvatarOperations } from "@/hooks/useUnitProfile";
import { CandidateSocialLinksDialog } from "@/components/profile/CandidateSocialLinksDialog";

const Profile = () => {
  const { data: session } = useSession();
  const { data: profileData, isLoading, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { toast } = useToast();

  const { uploadAvatar, deleteAvatar } = useAvatarOperations();

  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const handleImageSuccess = () => {
    refetch?.();
  };

  // FIXED: Logic handles both array-based and object-based (socialLinks) deletions using targetIndex or Key
  const handleDelete = async (
    field: string,
    targetIdentifier: number | string,
  ) => {
    try {
      const { data: freshProfile } = await refetch();
      const rawData = freshProfile?.[field as keyof typeof freshProfile];

      let updatedPayload;

      if (field === "socialLinks" && typeof targetIdentifier === "string") {
        // Handle object-based deletion for socialLinks
        const currentLinks = (rawData as Record<string, any>) || {};
        updatedPayload = Object.fromEntries(
          Object.entries(currentLinks).filter(
            ([key]) => key !== targetIdentifier,
          ),
        );
      } else if (Array.isArray(rawData)) {
        // Handle array-based deletion using index
        updatedPayload = rawData.filter((_, idx) => idx !== targetIdentifier);
      }

      await updateProfile({ [field]: updatedPayload });

      toast({ title: "Success", description: "Deleted successfully" });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  const skills = profileData?.skills ?? [];
  const education = profileData?.education ?? [];
  const projects = profileData?.projects ?? [];
  const interests = (profileData?.interests ?? []).filter(
    (i: string) => i !== "No Ideas" && i !== "I want to explore",
  );
  const languages: Language[] = profileData?.language ?? [];
  const completedCourses = profileData?.course ?? [];
  const internships = profileData?.internship ?? [];
  const links: Link[] = Array.isArray(profileData?.socialLinks)
    ? profileData.socialLinks
    : [];

  const profileCompletion = profileData?.profileScore || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="relative h-48 bg-gradient-to-r from-primary to-primary-foreground">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="container mx-auto px-4 -mt-24 relative z-10">
          <Card className="mb-8 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative h-[17.625rem] bg-gradient-to-r from-primary to-primary-foreground" />

      <div className="-mt-[8.25rem] pt-0 container px-4 sm:px-6 lg:px-[7.5rem] py-4 lg:py-10">
        <Card className="relative mb-2 min-h-[185px] h-auto border-gray-200 bg-white rounded-3xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group">
                <CircularProgress
                  percentage={profileCompletion}
                  size={90}
                  strokeWidth={3}
                >
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={profileData?.avatarUrl || profileData?.image || ""}
                    />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {profileData?.name?.charAt(0) ||
                        session?.user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </CircularProgress>
                <button
                  onClick={() => setIsAvatarDialogOpen(true)}
                  className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold">
                    {profileData?.name?.toLocaleUpperCase() || "Student Name"}
                  </h1>
                  {profileData && (
                    <PersonalDetailsDialog
                      profile={profileData}
                      onUpdate={() => refetch()}
                    >
                      <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary" />
                    </PersonalDetailsDialog>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">
                  {profileData?.type || profileData?.role || "User"}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>
                      {profileData?.email ||
                        session?.user?.email ||
                        "No email provided"}
                    </span>
                  </div>
                  {profileData?.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {profileData?.location
                        ? profileData.location[0].toLocaleUpperCase() +
                          profileData.location.slice(1)
                        : "Location not provided"}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm text-gray-400 mt-2.5">
                  {`Last updated - ${profileData?.updatedAt ? formatDistanceToNow(new Date(profileData.updatedAt), { addSuffix: true }) : "recently"}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <div className="lg:col-span-1 mb-4 lg:mb-0">
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
                <div className="space-y-3 text-sm">
                  {[
                    {
                      name: "Profile Summary",
                      component: ProfileSummaryDialog,
                      props: {
                        summary: profileData?.profileSummary || "",
                        onSave: refetch,
                      },
                    },
                    {
                      name: "Courses",
                      component: CourseDialog,
                      props: { onUpdate: refetch },
                    },
                    {
                      name: "Key Skills",
                      component: SkillsDialog,
                      props: { profile: profileData, onUpdate: refetch },
                    },
                    {
                      name: "Education",
                      component: EducationDialog,
                      props: { onUpdate: refetch },
                    },
                    {
                      name: "Projects",
                      component: ProjectDialog,
                      props: { onUpdate: refetch },
                    },
                    {
                      name: "Interests",
                      component: InterestDialog,
                      props: { interests, onUpdate: refetch },
                    },
                    {
                      name: "Internships",
                      component: InternshipDialog,
                      props: { onUpdate: refetch },
                    },
                    {
                      name: "Personal Details",
                      component: PersonalDetailsDialog,
                      props: { profile: profileData, onUpdate: refetch },
                    },
                    {
                      name: "Links",
                      component: UnitSocialLinksDialog,
                      props: {
                        currentLinks: links,
                        onSave: async (updatedLinksArray: any) => {
                          try {
                            const socialLinks = Object.fromEntries(
                              updatedLinksArray.map((l: any) => [
                                l.platform,
                                l.url,
                              ]),
                            );
                            await updateProfile({ socialLinks });
                            refetch();
                          } catch (e) {
                            console.error(e);
                          }
                        },
                      },
                    },
                  ].map((link) => {
                    const DialogComponent = link.component as any;
                    return (
                      <div
                        key={link.name}
                        className="flex items-center justify-between"
                      >
                        <span>{link.name}</span>
                        <DialogComponent {...link.props}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary p-0 h-auto"
                          >
                            Add
                          </Button>
                        </DialogComponent>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-2">
            {/* Profile Summary */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">Profile Summary</h3>
                  <ProfileSummaryDialog
                    summary={profileData?.profileSummary || ""}
                    onSave={refetch}
                  >
                    <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary" />
                  </ProfileSummaryDialog>
                </div>
                <div className="border border-gray-400 rounded-2xl p-3 min-h-28">
                  <div className="text-muted-foreground">
                    {profileData?.profileSummary || (
                      <div className="flex pr-2 items-center gap-1">
                        <AIEditIcon /> Get AI assistance to write your Profile
                        Summary
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Courses - FIXED index passing */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Completed Courses</h3>
                  <CourseDialog onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Completed Course
                    </Button>
                  </CourseDialog>
                </div>
                <div className="space-y-4">
                  {completedCourses.length > 0 ? (
                    completedCourses.map(
                      (course: CandidateCourse, index: number) => (
                        <div key={index}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{course.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {course.provider}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Completed on{" "}
                                {course.completion_date
                                  ? format(
                                      new Date(course.completion_date),
                                      "MMM dd, yyyy",
                                    )
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CourseDialog
                                course={{ ...course, index }}
                                onUpdate={refetch}
                              >
                                <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary mr-2" />
                              </CourseDialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete("course", index)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {index < completedCourses.length - 1 && (
                            <hr className="border-gray-200 mt-2.5" />
                          )}
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      No completed courses yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Skills */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">Key Skills</h3>
                  <SkillsDialog profile={profileData} onUpdate={refetch}>
                    <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary" />
                  </SkillsDialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-4 py-2 border-gray-400 bg-transparent"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Education - FIXED index passing */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <EducationDialog onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Education
                    </Button>
                  </EducationDialog>
                </div>
                <div className="space-y-4">
                  {education.map((edu: CandidateEducation, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">
                            {edu.start_year} - {edu.end_year || "Present"}
                          </p>
                          {edu.score && (
                            <p className="text-sm text-primary font-medium">
                              {edu.score} - CGPA
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <EducationDialog
                            education={{ ...edu, index }}
                            onUpdate={refetch}
                          >
                            <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary mr-2" />
                          </EducationDialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete("education", index)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects - FIXED index passing */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Projects</h3>
                  <ProjectDialog onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Project
                    </Button>
                  </ProjectDialog>
                </div>
                <div className="space-y-4">
                  {projects.map((project: CandidateProject, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {project.title || project.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {project.start_date
                              ? format(new Date(project.start_date), "MMM yyyy")
                              : ""}{" "}
                            - {project.end_date || "Present"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ProjectDialog
                          project={{ ...project, index }}
                          onUpdate={refetch}
                        >
                          <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary mr-2" />
                        </ProjectDialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete("projects", index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Interests</h3>
                  <InterestDialog interests={interests} onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Interest
                    </Button>
                  </InterestDialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-4 py-2 border-gray-400"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Internships - FIXED index passing */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Internships</h3>
                  <InternshipDialog onUpdate={refetch}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-transparent p-0"
                    >
                      Add Internship
                    </Button>
                  </InternshipDialog>
                </div>
                {internships.length > 0 ? (
                  <div className="space-y-6">
                    {internships.map(
                      (internship: CandidateInternship, index: number) => (
                        <div key={index} className="group relative">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h4 className="text-lg font-medium text-gray-900 leading-tight">
                                {internship.title || "Internship Title"}
                              </h4>
                              <p className="text-sm text-gray-400 mt-0.5 mb-2">
                                {internship.company || "Company Name"}
                              </p>
                              <p className="text-sm text-gray-500 leading-relaxed mb-3 max-w-[95%]">
                                {internship.description ||
                                  "No description provided."}
                              </p>
                              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                {internship.start_date
                                  ? format(
                                      new Date(internship.start_date),
                                      "MMM yyyy",
                                    )
                                  : "Start Date"}{" "}
                                -{" "}
                                {internship.is_current
                                  ? "Present"
                                  : internship.end_date
                                    ? format(
                                        new Date(internship.end_date),
                                        "MMM yyyy",
                                      )
                                    : "End date"}
                              </p>
                            </div>
                            <div className="flex items-center gap-6">
                              <InternshipDialog
                                internship={{ ...internship, index }}
                                onUpdate={refetch}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-500 hover:text-primary hover:bg-transparent h-auto p-1"
                                >
                                  <Pen className="w-4 h-4" />
                                </Button>
                              </InternshipDialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDelete("internship", index)
                                }
                                className="text-gray-500 hover:text-destructive hover:bg-transparent h-auto p-1"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No internships added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">Personal Details</h3>
                  {profileData && (
                    <PersonalDetailsDialog
                      profile={profileData}
                      onUpdate={() => refetch()}
                    >
                      <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary" />
                    </PersonalDetailsDialog>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Personal
                    </p>
                    <p className="font-medium">{`${profileData?.gender || "Not specified"}, ${profileData?.maritalStatus || "Single/ Unmarried"}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Career Break
                    </p>
                    <p className="font-medium">
                      {profileData?.hasCareerBreak ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Date Of Birth
                    </p>
                    <p className="font-medium">
                      {profileData?.dateOfBirth
                        ? format(
                            new Date(profileData.dateOfBirth),
                            "dd MMM yyyy",
                          )
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Differently Abled
                    </p>
                    <p className="font-medium">
                      {profileData?.isDifferentlyAbled ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Languages Section - FIXED index logic */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Languages</h3>
                  <PersonalDetailsDialog
                    profile={profileData}
                    onUpdate={() => refetch()}
                  >
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Languages
                    </Button>
                  </PersonalDetailsDialog>
                </div>
                <div className="space-y-4">
                  {languages.length > 0 ? (
                    <>
                      <div className="grid grid-cols-5 gap-4 text-sm text-center text-muted-foreground mb-2">
                        <span className="flex self-start">Language</span>
                        <span>Read</span>
                        <span>Write</span>
                        <span>Speak</span>
                        <span></span>
                      </div>
                      {languages.map((lang: Language, index: number) => (
                        <div
                          key={index}
                          className="grid grid-cols-5 items-center rounded-lg"
                        >
                          <span className="font-medium">
                            {lang.name || "Language"}
                          </span>
                          <div className="flex justify-center items-center">
                            {lang.read ? (
                              <CircleCheckBig className="w-4 text-blue-500" />
                            ) : (
                              <CircleX className="w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex justify-center items-center">
                            {lang.write ? (
                              <CircleCheckBig className="w-4 text-blue-500" />
                            ) : (
                              <CircleX className="w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex justify-center items-center">
                            {lang.speak ? (
                              <CircleCheckBig className="w-4 text-blue-500" />
                            ) : (
                              <CircleX className="w-4 text-red-500" />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete("language", index)}
                            className="text-muted-foreground hover:text-destructive justify-self-end"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      No languages added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Links Section - FIXED Object key deletion */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Links</h2>
                  <CandidateSocialLinksDialog
                    currentLinks={links}
                    onSave={async (updatedLinks: Link[]) => {
                      try {
                        await updateProfile({ socialLinks: updatedLinks });
                        toast({
                          title: "Success",
                          description: "Links updated",
                        });
                        refetch();
                      } catch (e) {
                        toast({
                          title: "Error",
                          description: "Update failed",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-transparent p-0"
                    >
                      Add Links
                    </Button>
                  </CandidateSocialLinksDialog>
                </div>
                <div className="space-y-4">
                  {links.length > 0 ? (
                    links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 group"
                      >
                        <p className="font-medium text-gray-900 capitalize min-w-[100px]">
                          {link.platform}
                        </p>
                        <div className="flex-1 px-4 py-2 border border-gray-200 rounded-2xl bg-white">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline truncate text-sm block"
                          >
                            {link.url}
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete("socialLinks", index)}
                          className="text-gray-300 hover:text-destructive hover:bg-transparent h-auto p-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No social links added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {profileData && (
        <ImageUploadDialog
          isOpen={isAvatarDialogOpen}
          onClose={() => setIsAvatarDialogOpen(false)}
          currentImageUrl={profileData.avatarUrl || profileData.image}
          userId={profileData.id}
          userName={profileData.name}
          imageType="avatar"
          entityType="candidate"
          onSuccess={handleImageSuccess}
          onUpload={(file) => uploadAvatar.mutateAsync(file)}
          onDelete={() => deleteAvatar.mutateAsync()}
          isProcessing={uploadAvatar.isPending || deleteAvatar.isPending}
        />
      )}
    </div>
  );
};

export default Profile;
