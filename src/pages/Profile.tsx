import { useProfileCompletion } from "@/hooks/useProfileCompletion";
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
  X,
  Sparkle,
  Pencil,
  Pen,
  CircleCheckBig,
  CircleX,
  Camera,
} from "lucide-react";
import { AvatarUploadDialog } from "@/components/AvatarUploadDialog";
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
import { Language } from "@/types/profiles.types";

const Profile = () => {
  const { data: session } = useSession();
  const { data: profileData, isLoading, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { toast } = useToast();

  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const handleAvatarUploadSuccess = () => {
    refetch?.();
  };

  const links =
    profileData?.socialLinks && typeof profileData.socialLinks === "object"
      ? Object.entries(profileData.socialLinks).map(([platform, url]) => ({
          id: platform,
          platform: platform,
          url: String(url),
        }))
      : [];

  const parseJsonField = (field: any, defaultValue: any = []) => {
    if (!field) return defaultValue;

    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        // If the parsed result is still a string, try parsing again (handles double-stringify)
        if (typeof parsed === "string") {
          return JSON.parse(parsed);
        }
        return parsed;
      } catch {
        return defaultValue;
      }
    }

    return Array.isArray(field) ? field : defaultValue;
  };

  const parseLanguages = (field: any): Language[] => {
    if (!field) return [];

    // If it's already an array of Language objects, return it
    if (Array.isArray(field)) {
      // Check if items are already objects
      if (field.length > 0 && typeof field[0] === "object" && field[0].id) {
        return field;
      }

      // If items are JSON strings, parse them
      return field
        .map((lang) => {
          if (typeof lang === "string") {
            try {
              const parsed = JSON.parse(lang);
              // Handle double-stringification
              if (typeof parsed === "string") {
                return JSON.parse(parsed);
              }
              return parsed;
            } catch {
              return null;
            }
          }
          return lang;
        })
        .filter(Boolean);
    }

    // If it's a string, try to parse it
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        // Handle double-stringification
        if (typeof parsed === "string") {
          return parseLanguages(JSON.parse(parsed));
        }
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  const handleDelete = async (field: string, itemId: string) => {
    try {
      const rawData = profileData?.[field as keyof typeof profileData];
      let updatedPayload: any;

      if (field === "socialLinks") {
        const currentLinksRecord =
          (typeof rawData === "string" ? JSON.parse(rawData) : rawData) || {};

        updatedPayload = Object.keys(currentLinksRecord)
          .filter((key) => key !== itemId)
          .reduce((acc: any, key) => {
            acc[key] = currentLinksRecord[key];
            return acc;
          }, {});
      } else {
        const existingArray = parseJsonField(rawData, []);
        updatedPayload = existingArray.filter((item: any) => {
          const id = item.id || item.title || item.name;
          return id !== itemId;
        });
      }

      await updateProfile({ [field]: updatedPayload });

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  // Safe data extraction
  const skills = parseJsonField(profileData?.skills, []);
  const education = parseJsonField(profileData?.education, []);
  const projects = parseJsonField(profileData?.projects, []);
  const interests = parseJsonField(profileData?.interests, []).filter(
    (i: string) => i !== "No Ideas" && i !== "I want to explore",
  );
  const languages: Language[] = parseLanguages(profileData?.language);
  const completedCourses = parseJsonField(profileData?.course, []);
  const internships = parseJsonField(profileData?.internship, []);

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
        {/* Profile Header */}
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
                  {`Last updated - ${
                    profileData?.updatedAt
                      ? formatDistanceToNow(new Date(profileData.updatedAt), {
                          addSuffix: true,
                        })
                      : "recently"
                  }`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Left Sidebar - Quick Links */}
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
                        currentLinks: links, // Pass the converted links array
                        onSave: async (updatedLinksArray: any) => {
                          try {
                            const socialLinksRecord = updatedLinksArray.reduce(
                              (acc: any, curr: any) => {
                                if (curr.platform && curr.url)
                                  acc[curr.platform] = curr.url;
                                return acc;
                              },
                              {},
                            );
                            await updateProfile({
                              socialLinks: socialLinksRecord,
                            });
                            refetch();
                          } catch (error) {
                            console.error(error);
                          }
                        },
                      },
                    },
                  ].map((link) => {
                    // Cast to any to handle the heterogeneous props across different dialogs
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

          {/* Main Content */}
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
                        <AIEditIcon />
                        Get AI assistance to write your Profile Summary
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Courses */}
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
                    completedCourses.map((course: any, index: number) => (
                      <div key={course.id || index}>
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
                            <CourseDialog course={course} onUpdate={refetch}>
                              <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary mr-2" />
                            </CourseDialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  "course",
                                  course.id || course.title,
                                )
                              }
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
                    ))
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

            {/* Education */}
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
                  {education.map((edu: any, index: number) => (
                    <div
                      key={edu.id || index}
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
                          {/* Added Education Edit Option */}
                          <EducationDialog education={edu} onUpdate={refetch}>
                            <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary mr-2" />
                          </EducationDialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete("education", edu.id || edu.degree)
                            }
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

            {/* Projects */}
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
                  {projects.map((project: any, index: number) => (
                    <div
                      key={project.id || index}
                      className="flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {project.projectName || project.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {project.start_date
                              ? format(new Date(project.start_date), "MMM yyyy")
                              : ""}{" "}
                            -{" "}
                            {project.completionDate ||
                              project.end_date ||
                              "Present"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Added Project Edit Option */}
                        <ProjectDialog project={project} onUpdate={refetch}>
                          <Pen className="w-4 h-4 text-gray-500 cursor-pointer hover:text-primary mr-2" />
                        </ProjectDialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(
                              "projects",
                              project.id ||
                                project.projectName ||
                                project.title,
                            )
                          }
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

            {/* Internships */}
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
                    {internships.map((internship: any, index: number) => (
                      <div
                        key={internship.id || index}
                        className="group relative"
                      >
                        <div className="flex justify-between items-start">
                          {/* Left Content Area */}
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
                                ? "End date"
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
                              internship={internship}
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
                                handleDelete(
                                  "internship",
                                  internship.id || internship.title,
                                )
                              }
                              className="text-gray-500 hover:text-destructive hover:bg-transparent h-auto p-1"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No internships added yet. Add your internship experience!
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
                      onUpdate={refetch}
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
                    <p className="font-medium">
                      {`${profileData?.gender || "Not specified"}, ${
                        profileData?.maritalStatus || "Single/ Unmarried"
                      }`}
                    </p>
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

            {/* Languages */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Languages</h3>
                  <PersonalDetailsDialog
                    profile={profileData}
                    onUpdate={refetch}
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
                          key={lang.id || index}
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
                            onClick={async () => {
                              try {
                                const updatedLanguages = languages.filter(
                                  (l: Language) => l.id !== lang.id,
                                );

                                await updateProfile({
                                  language: updatedLanguages.map((lang) =>
                                    JSON.stringify(lang),
                                  ),
                                });

                                toast({
                                  title: "Success",
                                  description: "Language deleted successfully",
                                });

                                refetch();
                              } catch (error) {
                                console.error(
                                  "Error deleting language:",
                                  error,
                                );
                                toast({
                                  title: "Error",
                                  description: "Failed to delete language",
                                  variant: "destructive",
                                });
                              }
                            }}
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

            {/* Links Section */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Links</h2>
                  <UnitSocialLinksDialog
                    currentLinks={links}
                    onSave={async (updatedLinksArray) => {
                      try {
                        // Convert Array back to Record for API compliance
                        const socialLinksRecord = updatedLinksArray.reduce(
                          (acc, curr) => {
                            if (curr.platform && curr.url)
                              acc[curr.platform] = curr.url;
                            return acc;
                          },
                          {} as Record<string, string>,
                        );

                        await updateProfile({
                          socialLinks: socialLinksRecord as any,
                        });
                        toast({
                          title: "Success",
                          description: "Links updated",
                        });
                        refetch();
                      } catch (error) {
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
                  </UnitSocialLinksDialog>
                </div>

                <div className="space-y-4">
                  {links.map((link) => (
                    <div
                      key={link.id}
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
                        // link.id here is the platform name (e.g., "linkedin")
                        onClick={() => handleDelete("socialLinks", link.id)}
                        className="text-gray-300 hover:text-destructive hover:bg-transparent h-auto p-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {profileData && (
        <AvatarUploadDialog
          isOpen={isAvatarDialogOpen}
          onClose={() => setIsAvatarDialogOpen(false)}
          currentAvatarUrl={profileData.avatarUrl || profileData.image || ""}
          userId={profileData.id}
          userName={profileData.name}
          onSuccess={handleAvatarUploadSuccess}
        />
      )}
    </div>
  );
};

export default Profile;
