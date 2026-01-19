import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Trash2,
  X,
  Pencil,
  Building2,
  ZoomIn,
  Video,
  ChevronLeft,
  ChevronRight,
  Camera,
} from "lucide-react";

// 1. IMPORT HOOKS
import {
  useUnitProfile,
  useUpdateUnitProfile,
  useAvatarOperations,
  useBannerOperations,
} from "@/hooks/useUnitProfile";
import { useSession } from "@/lib/auth-client";

// 2. IMPORT TYPES
import type { Profile, Project, SocialLink } from "@/types/profiles.types";

// Components
import { UnitDetailsDialog } from "@/components/unit/UnitDetailsDialog";
import { UnitDescriptionDialog } from "@/components/unit/UnitDescriptionDialog";
import { UnitProjectDialog } from "@/components/unit/UnitProjectDialog";
import { UnitSocialLinksDialog } from "@/components/unit/UnitSocialLinksDialog";
import { GalleryDialog } from "@/components/GalleryDialog";
import { GlimpseDialog } from "@/components/GlimpseDialog";
import { CircularProgress } from "@/components/CircularProgress";
import { ImageUploadDialog } from "@/components/ImageUploadDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  type ProjectFormValues, // Import the type here
} from "@/lib/unitDialogSchemas";

const UnitProfile = () => {
  const { data: session } = useSession();
  const user = session?.user;

  // 3. USE REACT QUERY HOOKS WITH TYPE
  const { data: profileData, isLoading, refetch } = useUnitProfile();
  const { uploadAvatar, deleteAvatar } = useAvatarOperations();
  const { uploadBanner, deleteBanner } = useBannerOperations();

  // Cast strictly if the hook returns a generic type, otherwise rely on hook inference
  const profile = profileData as Profile | undefined;

  const updateMutation = useUpdateUnitProfile();

  // Dialog States
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  const [isGlimpseDialogOpen, setIsGlimpseDialogOpen] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 4. ACTION HANDLERS

  // Update Profile fields (Mission, Values, Description, etc.)
  const handleUpdateProfile = (updates: Partial<Profile>) => {
    updateMutation.mutate(updates);
  };

  // Add Project
  const handleAddProject = (projectData: ProjectFormValues) => {
    const currentProjects = profile?.projects || [];
    // Optimistic update logic handled by React Query cache or refetch
    // For now, assume backend adds it and we refetch or we send full array
    const updatedProjects = [...currentProjects, projectData] as Project[];
    updateMutation.mutate({ projects: updatedProjects });
  };

  // Remove Project
  const handleRemoveProject = (projectId: string) => {
    if (!projectId) return;
    const currentProjects = profile?.projects || [];
    const updatedProjects = currentProjects.filter((p) => p.id !== projectId);
    updateMutation.mutate({ projects: updatedProjects });
  };

  // Update Social Links
  const handleUpdateSocialLinks = (links: SocialLink[]) => {
    updateMutation.mutate({ socialLinks: [...links] });
  };

  // Remove Social Link
  const handleRemoveSocialLink = (linkId: string) => {
    const currentLinks = profile?.socialLinks || [];
    const updatedLinks = currentLinks.filter((l) => l.id !== linkId);
    updateMutation.mutate({ socialLinks: updatedLinks });
  };

  // Refetch after image uploads
  const handleImageSuccess = () => {
    refetch();
  };

  // 5. DATA MAPPING (Safe Defaults)
  const projects = profile?.projects || [];
  const galleryImages = profile?.galleryImages || [];
  const socialLinks = profile?.socialLinks || [];
  const glimpseUrl = profile?.galleryVideos || null;
  const profileScore = profile?.profileScore || 0;

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

      {/* Hero Background - Banner */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-r from-primary to-primary-foreground group">
        {profile?.bannerUrl ? (
          <img
            src={profile.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-black/20" />
        )}
        <button
          onClick={() => setIsBannerDialogOpen(true)}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="-mt-16 sm:-mt-20 md:-mt-24 pt-0 container px-4 sm:px-6 lg:px-24 py-4 lg:py-10 mb-6 relative z-10">
        {/* Profile Header */}
        <Card className="mb-2 sm:mb-4 bg-white rounded-3xl border-gray-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group">
                <CircularProgress
                  percentage={profileScore}
                  size={90}
                  strokeWidth={3}
                >
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatarUrl || undefined} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {profile?.name?.charAt(0) || "U"}
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

              <div className="flex-1 w-full">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {profile?.name || "Unit Name"}
                  </h1>
                  <UnitDetailsDialog
                    unitProfile={profile}
                    onUpdateUnit={handleUpdateProfile}
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary" />
                  </UnitDetailsDialog>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-2">
                  {profile?.type || "Organization"} •{" "}
                  {profile?.industry || "Industry"}
                </p>

                <div className="mb-4 flex items-start gap-2">
                  <p className="text-xs sm:text-sm text-muted-foreground flex-1">
                    {profile?.description ||
                      "Tell the world about your organization - what you do, who you serve, and what makes you unique."}
                  </p>
                  <UnitDescriptionDialog
                    description={profile?.description || ""}
                    onSave={(description) =>
                      handleUpdateProfile({ description })
                    }
                    title="Edit About Us"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-primary flex-shrink-0 mt-0.5" />
                  </UnitDescriptionDialog>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate max-w-[200px] sm:max-w-none">
                      {profile?.email || user?.email || "No email provided"}
                    </span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[150px] sm:max-w-none">
                        {profile.address}
                      </span>
                    </div>
                  )}
                  {profile?.websiteUrl && (
                    <div className="flex items-center space-x-1">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                      <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar & Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Left Sidebar - Quick Links */}
          <div className="lg:col-span-1 mb-4 lg:mb-0">
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-4">
                  Quick Links
                </h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Unit Details Link */}
                  <div className="flex items-center justify-between">
                    <span>Unit Details</span>
                    <UnitDetailsDialog
                      unitProfile={profile}
                      onUpdateUnit={handleUpdateProfile}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-0 h-auto"
                      >
                        Edit
                      </Button>
                    </UnitDetailsDialog>
                  </div>

                  {/* About Us Link */}
                  <div className="flex items-center justify-between">
                    <span>About Us</span>
                    <UnitDescriptionDialog
                      description={profile?.description || ""}
                      onSave={(description) =>
                        handleUpdateProfile({ description })
                      }
                      title="Edit About Us"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-0 h-auto"
                      >
                        Edit
                      </Button>
                    </UnitDescriptionDialog>
                  </div>

                  {/* Glimpse Link */}
                  <div className="flex items-center justify-between">
                    <span>Glimpse</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary p-0 h-auto"
                      onClick={() => setIsGlimpseDialogOpen(true)}
                    >
                      {glimpseUrl ? "Edit" : "Add"}
                    </Button>
                  </div>

                  {/* Mission Link */}
                  <div className="flex items-center justify-between">
                    <span>Mission</span>
                    <UnitDescriptionDialog
                      description={profile?.mission || ""}
                      onSave={(mission) => handleUpdateProfile({ mission })}
                      title="Edit Mission"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-0 h-auto"
                      >
                        Edit
                      </Button>
                    </UnitDescriptionDialog>
                  </div>

                  {/* Values Link */}
                  <div className="flex items-center justify-between">
                    <span>Values</span>
                    <UnitDescriptionDialog
                      description={profile?.values || ""}
                      onSave={(values) => handleUpdateProfile({ values })}
                      title="Edit Values"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-0 h-auto"
                      >
                        Edit
                      </Button>
                    </UnitDescriptionDialog>
                  </div>

                  {/* Projects Link */}
                  <div className="flex items-center justify-between">
                    <span>Projects</span>
                    <UnitProjectDialog onSave={handleAddProject}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-0 h-auto"
                      >
                        Add
                      </Button>
                    </UnitProjectDialog>
                  </div>

                  {/* Social Links Link */}
                  <div className="flex items-center justify-between">
                    <span>Social Links</span>
                    <UnitSocialLinksDialog
                      onSave={handleUpdateSocialLinks}
                      currentLinks={socialLinks}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-0 h-auto"
                      >
                        Manage
                      </Button>
                    </UnitSocialLinksDialog>
                  </div>

                  {/* Gallery Link */}
                  <div className="flex items-center justify-between">
                    <span>Gallery</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary p-0 h-auto"
                      onClick={() => setIsGalleryDialogOpen(true)}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-2 sm:space-y-4">
            {/* Projects Section */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold">Projects</h3>
                  <UnitProjectDialog onSave={handleAddProject}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary text-xs sm:text-sm"
                    >
                      Add Project
                    </Button>
                  </UnitProjectDialog>
                </div>

                {projects.length > 0 ? (
                  <div className="divide-y divide-border">
                    {projects.map((project, index) => (
                      <div key={index} className="py-3 sm:py-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base text-foreground">
                              {project.projectName || "Untitled Project"}
                            </h4>

                            {project.clientName && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                {project.clientName}
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground mt-2">
                              {project.status === "Completed" &&
                              project.completionDate ? (
                                <>
                                  Completed on{" "}
                                  {new Date(
                                    project.completionDate
                                  ).toLocaleDateString()}
                                </>
                              ) : (
                                <span className="capitalize">
                                  {project.status}
                                </span>
                              )}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (project.id) handleRemoveProject(project.id);
                            }}
                            className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Showcase the projects and initiatives your organization has
                    worked on.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Mission Section */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    Mission
                    <UnitDescriptionDialog
                      description={profile?.mission || ""}
                      onSave={(mission) => handleUpdateProfile({ mission })}
                      title="Edit Mission"
                    >
                      <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-pointer hover:text-primary" />
                    </UnitDescriptionDialog>
                  </h3>
                </div>
                <div className="rounded-xl min-h-[100px]">
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                    {profile?.mission ||
                      "Define your organization's mission statement - the purpose and primary objectives that drive your work."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Values Section */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    Values
                    <UnitDescriptionDialog
                      description={profile?.values || ""}
                      onSave={(values) => handleUpdateProfile({ values })}
                      title="Edit Values"
                    >
                      <Pencil className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground cursor-pointer hover:text-primary" />
                    </UnitDescriptionDialog>
                  </h3>
                </div>
                <div className="rounded-xl min-h-[100px]">
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                    {profile?.values ||
                      "Describe the principles and ethics that define your organization's culture and decisions."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Links Section */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Social Links
                  </h2>
                  <UnitSocialLinksDialog
                    onSave={handleUpdateSocialLinks}
                    currentLinks={socialLinks}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary text-xs sm:text-sm"
                    >
                      Add Links
                    </Button>
                  </UnitSocialLinksDialog>
                </div>

                {socialLinks.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {socialLinks.map((link, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:grid sm:grid-cols-5 gap-2 sm:items-center"
                      >
                        <p className="font-medium capitalize text-sm sm:text-base">
                          {link.platform}
                        </p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-blue-600 hover:underline break-all sm:col-span-3 border border-gray-400 rounded-xl px-3 py-2"
                        >
                          {link.url}
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSocialLink(link.id)}
                          className="text-muted-foreground hover:text-destructive sm:justify-self-end self-end"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No social links added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Glimpse of the Unit Section */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                    Glimpse of the Unit
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-xs sm:text-sm"
                    onClick={() => setIsGlimpseDialogOpen(true)}
                  >
                    {glimpseUrl ? "Edit Video" : "Add Video"}
                  </Button>
                </div>
                {glimpseUrl ? (
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                    <video
                      src={glimpseUrl}
                      controls
                      controlsList="nodownload"
                      className="w-full h-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 border-2 border-dashed rounded-xl">
                    <Video className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground px-4">
                      Add a video to give visitors a glimpse of your
                      organization
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gallery Section */}
            <Card className="rounded-3xl border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold">Gallery</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary text-xs sm:text-sm"
                    onClick={() => setIsGalleryDialogOpen(true)}
                  >
                    {galleryImages.length > 0 ? "Manage Gallery" : "Add Images"}
                  </Button>
                </div>

                {galleryImages.length > 0 ? (
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                      onClick={() =>
                        scrollRef.current?.scrollBy({
                          left: -300,
                          behavior: "smooth",
                        })
                      }
                      className="hidden sm:block bg-white border border-border rounded-full shadow-md p-2 hover:bg-accent flex-shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <div
                      ref={scrollRef}
                      className="flex overflow-x-auto space-x-3 sm:space-x-4 scroll-smooth no-scrollbar"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {galleryImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative flex-shrink-0 w-48 h-48 sm:w-64 sm:h-64 rounded-lg overflow-hidden border border-border group cursor-pointer"
                          onClick={() => setViewImage(image)}
                        >
                          <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() =>
                        scrollRef.current?.scrollBy({
                          left: 300,
                          behavior: "smooth",
                        })
                      }
                      className="hidden sm:block bg-white border border-border rounded-full shadow-md p-2 hover:bg-accent flex-shrink-0"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Building2 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground px-4">
                      Add photos to showcase your organization's work, events,
                      and team.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* All Upload & Details Dialogs */}
      {profile && (
        <>
          {/* Avatar Dialog */}
          <ImageUploadDialog
            isOpen={isAvatarDialogOpen}
            onClose={() => setIsAvatarDialogOpen(false)}
            currentImageUrl={profile.avatarUrl}
            userId={profile.id}
            userName={profile.name}
            imageType="avatar"
            entityType="unit"
            onSuccess={handleImageSuccess}
            onUpload={(file) => uploadAvatar.mutateAsync(file)}
            onDelete={() => deleteAvatar.mutateAsync()}
            isProcessing={uploadAvatar.isPending || deleteAvatar.isPending}
          />

          {/* Banner Dialog */}
          <ImageUploadDialog
            isOpen={isBannerDialogOpen}
            onClose={() => setIsBannerDialogOpen(false)}
            currentImageUrl={profile.bannerUrl}
            userId={profile.id}
            userName={profile.name}
            imageType="banner"
            entityType="unit"
            onSuccess={handleImageSuccess}
            onUpload={(file) => uploadBanner.mutateAsync(file)}
            onDelete={() => deleteBanner.mutateAsync()}
            isProcessing={uploadBanner.isPending || deleteBanner.isPending}
          />

          <GalleryDialog
            isOpen={isGalleryDialogOpen}
            onClose={() => setIsGalleryDialogOpen(false)}
            userId={profile.id}
            currentImages={galleryImages}
            onSuccess={handleImageSuccess}
          />

          <GlimpseDialog
            isOpen={isGlimpseDialogOpen}
            onClose={() => setIsGlimpseDialogOpen(false)}
            userId={profile.id}
            currentGlimpseUrl={glimpseUrl}
            onSuccess={handleImageSuccess}
          />
        </>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="sm:max-w-4xl">
          <div className="relative">
            <img
              src={viewImage || ""}
              alt="Full size preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnitProfile;
