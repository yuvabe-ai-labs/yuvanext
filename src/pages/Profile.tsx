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
import { ImageUploadDialog } from "@/components/ImageUploadDialog";
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
import { useProfile, useUpdateProfile, useAvatarOperations } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { UnitSocialLinksDialog } from "@/components/unit/UnitSocialLinksDialog";
import { Language, CandidateCourse, CandidateEducation, CandidateInternship, Project, SocialLink} from "@/types/profiles.types";

const Profile = () => {
  const { data: session } = useSession();
  const { data: profileData, isLoading, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { uploadAvatar, deleteAvatar } = useAvatarOperations();
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
          // Add more fields to check based on the type
          const id =
            item.id ||
            item.title ||
            item.name ||
            item.degree ||
            item.projectName;
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
  const languages: Language[] = parseJsonField(profileData?.language);
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
                  <PersonalDetailsDialog
                    profile={profileData}
                    onUpdate={refetch}
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary" />
                  </PersonalDetailsDialog>
                </div>
                <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{profileData?.email || "Not provided"}</span>
                  </div>
                  {profileData?.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                  {profileData?.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {profileCompletion}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Profile Complete
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Profile Summary */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Profile Summary</h3>
                  <ProfileSummaryDialog
                    profile={profileData}
                    onUpdate={refetch}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto hover:bg-transparent"
                    >
                      <AIEditIcon className="w-5 h-5" />
                    </Button>
                  </ProfileSummaryDialog>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {profileData?.summary ||
                    "Add a brief summary about yourself, your skills, and career goals."}
                </p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <SkillsDialog profile={profileData} onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Skills
                    </Button>
                  </SkillsDialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Interests</h3>
                  <InterestDialog profile={profileData} onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Interests
                    </Button>
                  </InterestDialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.length > 0 ? (
                    interests.map((interest: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-primary text-primary"
                      >
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No interests added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Education */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <EducationDialog profile={profileData} onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Education
                    </Button>
                  </EducationDialog>
                </div>
                <div className="space-y-4">
                  {education.length > 0 ? (
                    education.map(
                      (edu: CandidateEducation, index: number) => (
                        <div
                          key={edu.id || index}
                          className="border-l-2 border-primary pl-4 relative"
                        >
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{edu.degree}</h4>
                              <p className="text-sm text-muted-foreground">
                                {edu.institution}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {edu.startDate && edu.endDate
                                  ? `${format(
                                      new Date(edu.startDate),
                                      "MMM yyyy",
                                    )} - ${
                                      edu.current
                                        ? "Present"
                                        : format(
                                            new Date(edu.endDate),
                                            "MMM yyyy",
                                          )
                                    }`
                                  : "Duration not specified"}
                              </p>
                              {edu.grade && (
                                <p className="text-sm mt-1">
                                  Grade: {edu.grade}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  "education",
                                  edu.id || edu.degree,
                                )
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      No education added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Projects</h3>
                  <ProjectDialog profile={profileData} onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Project
                    </Button>
                  </ProjectDialog>
                </div>
                <div className="space-y-4">
                  {projects.length > 0 ? (
                    projects.map((project: Project, index: number) => (
                      <div
                        key={project.id || index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">
                            {project.projectName || project.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                "projects",
                                project.id || project.projectName,
                              )
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {project.description}
                        </p>
                        {project.technologies && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(
                              Array.isArray(project.technologies)
                                ? project.technologies
                                : typeof project.technologies === "string"
                                  ? project.technologies.split(",")
                                  : []
                            ).map((tech: string, techIndex: number) => (
                              <Badge
                                key={techIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tech.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No projects added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Internships */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Internships</h3>
                  <InternshipDialog profile={profileData} onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Internship
                    </Button>
                  </InternshipDialog>
                </div>
                <div className="space-y-4">
                  {internships.length > 0 ? (
                    internships.map(
                      (internship: CandidateInternship, index: number) => (
                        <div
                          key={internship.id || index}
                          className="border-l-2 border-primary pl-4 relative"
                        >
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {internship.role}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {internship.company}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {internship.startDate && internship.endDate
                                  ? `${format(
                                      new Date(internship.startDate),
                                      "MMM yyyy",
                                    )} - ${
                                      internship.current
                                        ? "Present"
                                        : format(
                                            new Date(internship.endDate),
                                            "MMM yyyy",
                                          )
                                    }`
                                  : "Duration not specified"}
                              </p>
                              {internship.description && (
                                <p className="text-sm mt-2">
                                  {internship.description}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  "internship",
                                  internship.id || internship.role,
                                )
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      No internships added yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Completed Courses */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Completed Courses</h3>
                  <CourseDialog profile={profileData} onUpdate={refetch}>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Add Course
                    </Button>
                  </CourseDialog>
                </div>
                <div className="space-y-3">
                  {completedCourses.length > 0 ? (
                    completedCourses.map(
                      (course: CandidateCourse, index: number) => (
                        <div
                          key={course.id || index}
                          className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {course.provider}
                            </p>
                            {course.completionDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Completed{" "}
                                {formatDistanceToNow(
                                  new Date(course.completionDate),
                                  {
                                    addSuffix: true,
                                  },
                                )}
                              </p>
                            )}
                            {course.certificateUrl && (
                              <a
                                href={course.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline mt-1 inline-block"
                              >
                                View Certificate →
                              </a>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete("course", course.id || course.title)
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      No courses added yet.
                    </p>
                  )}
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

      {/* Avatar Upload Dialog - Using ImageUploadDialog like UnitProfile */}
      {profileData && (
        <ImageUploadDialog
          isOpen={isAvatarDialogOpen}
          onClose={() => setIsAvatarDialogOpen(false)}
          currentImageUrl={profileData.avatarUrl || profileData.image || ""}
          userId={profileData.id}
          userName={profileData.name}
          imageType="avatar"
          entityType="candidate"
          onSuccess={handleAvatarUploadSuccess}
          onUpload={(file) => uploadAvatar.mutateAsync(file)}
          onDelete={() => deleteAvatar.mutateAsync()}
          isProcessing={uploadAvatar.isPending || deleteAvatar.isPending}
        />
      )}
    </div>
  );
};

export default Profile;