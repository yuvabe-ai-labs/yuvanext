import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useUnitView } from "@/hooks/useUnitView";
import ProfileSummaryDialog from "@/components/ProfileSummaryDialog";
import ApplicationSuccessDialog from "@/components/ApplicationSuccessDialog";
import type { Tables } from "@/integrations/supabase/types";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  ThreadIcon,
  TwitterIcon,
} from "@/components/ui/custom-icons";

const safeParse = (data: any, fallback: any) => {
  if (!data) return fallback;
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return fallback;
  }
};

const UnitView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { unit, internships, loading, error } = useUnitView(id || "");
  const [selectedInternship, setSelectedInternship] =
    useState<Tables<"internships"> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleApply = (internship: Tables<"internships">) => {
    setSelectedInternship(internship);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Skeleton className="h-64 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Unit Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || "The unit you are looking for does not exist."}
          </p>
          <Button onClick={() => navigate("/units")}>Back to Units</Button>
        </div>
      </div>
    );
  }

  const recentProjects = safeParse(unit.projects, []);
  const values = safeParse(unit.values, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative h-[17.625rem] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        {unit.banner_url && (
          <img
            src={unit.banner_url}
            alt={unit.unit_name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="md:-mt-[8.25rem] pt-0 container p-0 md:px-[7.5rem]  md:py-10">
        {/* Hero Section with Unit Info */}
        <Card className="relative border border-gray-200 md:mb-2.5 overflow-hidden border-border bg-white rounded-none md:rounded-3xl">
          <CardContent className="p-[1.875rem]">
            <div className="flex flex-col md:flex-row items-start gap-7">
              {/* Unit Logo */}
              <div className="hidden md:flex justify-center items-center w-32 h-32 rounded-full bg-background border-4 border-background shadow-md text-4xl font-bold text-foreground overflow-hidden">
                {(unit as any).avatar_url ? (
                  <img
                    src={(unit as any).avatar_url}
                    alt={unit.unit_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  unit.unit_name?.charAt(0) || "U"
                )}
              </div>

              {/* Unit Details */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2 flex gap-2.5">
                  {/* Unit Logo For Mobile*/}
                  <div className="w-10 h-10 md:hidden rounded-full bg-background border-4 border-background shadow-md text-4xl font-bold text-foreground overflow-hidden">
                    {(unit as any).avatar_url ? (
                      <img
                        src={(unit as any).avatar_url}
                        alt={unit.unit_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      unit.unit_name?.charAt(0) || "U"
                    )}
                  </div>
                  {unit.unit_name}
                </h1>
                <p className="text-muted-foreground mb-3 pr-4">
                  {unit.description ||
                    "A unit focused on creating meaningful experiences."}
                </p>

                {/* Contact Info Row */}
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-4">
                  {unit.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{unit.contact_email}</span>
                    </div>
                  )}
                  {unit.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{unit.contact_phone}</span>
                    </div>
                  )}
                  {unit.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{unit.address}</span>
                    </div>
                  )}
                </div>

                {/* Visit Website and Social Links */}
                <div className="flex gap-4 items-center">
                  {unit.website_url && (
                    <button className="text-[#020817] font-medium border-gray-600 border bg-transparent px-3 py-1 rounded-full">
                      <a
                        href={unit.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {/* <Globe className="w-4 h-4" /> */}
                        Visit Website
                      </a>
                    </button>
                    // <Button
                    //   variant="outline"
                    //   className="gap-2 border-gray-600 font-medium text-[#020817] py-3 rounded-full"
                    //   asChild
                    // >
                    //   <a
                    //     href={unit.website_url}
                    //     target="_blank"
                    //     rel="noopener noreferrer"
                    //   >
                    //     {/* <Globe className="w-4 h-4" /> */}
                    //     Visit Website
                    //   </a>
                    // </Button>
                  )}

                  {/* Social Links */}
                  {(() => {
                    const socialLinks = safeParse(unit.social_links, []);
                    if (socialLinks.length === 0) return null;

                    const getSocialIcon = (link: any) => {
                      // Detect platform from URL or platform field
                      const url = (link.url || link).toLowerCase();
                      const platform = (link.platform || "").toLowerCase();

                      if (
                        platform.includes("linkedin") ||
                        url.includes("linkedin.com")
                      )
                        return LinkedinIcon;
                      if (
                        platform.includes("instagram") ||
                        url.includes("instagram.com")
                      )
                        return InstagramIcon;
                      if (
                        platform.includes("facebook") ||
                        url.includes("facebook.com")
                      )
                        return FacebookIcon;
                      if (
                        platform.includes("twitter") ||
                        platform.includes("x") ||
                        url.includes("twitter.com") ||
                        url.includes("x.com")
                      )
                        return TwitterIcon;
                      if (
                        platform.includes("thread") ||
                        url.includes("thread.com")
                      )
                        return ThreadIcon;
                    };

                    return (
                      <div className="flex gap-4 font-bold">
                        {socialLinks.map((link: any, idx: number) => {
                          const Icon = getSocialIcon(link);
                          const url = link.url || link;
                          return (
                            <button
                              key={idx}
                              className="bg-transparent text-[#020817] p-0"
                              // asChild
                            >
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Icon className="w-5 h-5" />
                              </a>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div>
          {/* Left Column - Open Internship Positions */}
          <div>
            <div className="border border-gray-200 p-8 rounded-none md:rounded-3xl">
              <h2 className="text-xl font-medium text-foreground mb-5">
                Open Internship Positions
              </h2>

              {internships.length === 0 ? (
                <Card className="p-8 text-center border-0.5 border-gray-300">
                  <p className="text-muted-foreground">
                    No open positions at the moment.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {internships.map((internship) => {
                    const skillsRequired = safeParse(
                      internship.skills_required,
                      []
                    );

                    return (
                      <Card
                        key={internship.id}
                        className="border-[0.5px] border-gray-300 rounded-xl hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Internship Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex gap-2.5">
                                  {/* Internship Icon */}
                                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-bold">
                                      {unit.avatar_url ? (
                                        <img
                                          className="w-12 h-12 rounded-full"
                                          src={unit.avatar_url}
                                          alt={`${unit.unit_name} logo`}
                                        />
                                      ) : (
                                        internship.title.charAt(0)
                                      )}
                                    </span>
                                  </div>

                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                                      {internship.title}
                                    </h3>
                                    {internship.duration && (
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{internship.duration}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* View Button */}
                                <Button
                                  variant="gradient"
                                  className="rounded-full text-white invisible md:visible"
                                  onClick={() =>
                                    navigate(`/internships/${internship.id}`)
                                  }
                                >
                                  View
                                </Button>
                              </div>

                              <p className="text-sm text-gray-400 mb-3 line-clamp-2 lg:pr-[8.56rem]">
                                {internship.description}
                              </p>

                              {/* Skills */}
                              {skillsRequired.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-foreground">
                                    Skills:
                                  </span>
                                  {skillsRequired
                                    .slice(0, 5)
                                    .map((skill: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="text-xs text-muted-foreground"
                                      >
                                        {skill}
                                        {idx <
                                          Math.min(skillsRequired.length, 5) -
                                            1 && ","}
                                      </span>
                                    ))}
                                </div>
                              )}

                              {/* View Button */}
                              <Button
                                variant="gradient"
                                className="rounded-full bg-clip-text text-transparent border border-orange-600 visible w-full bg-transparent md:hidden mt-4"
                                onClick={() =>
                                  navigate(`/internships/${internship.id}`)
                                }
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          {/* <div className="space-y-6"> */}
          {/* Recent Projects */}
          {/* <Card className="border-border rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Recent Projects
                  </h3>
                  {recentProjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No recent projects listed.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {recentProjects.map((project: any, idx: number) => {
                        // Derive a safe title for the project. Projects may be strings or objects with
                        // different field names depending on source. Avoid rendering raw objects.
                        const title =
                          typeof project === "string"
                            ? project
                            : project?.project_name ||
                              project?.projectName ||
                              project?.name ||
                              project?.client_name ||
                              JSON.stringify(project);

                        return (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <GraduationCap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground">{title}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card> */}

          {/* Contact Info */}
          {/* <Card className="border-border rounded-3xl">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Contact Info
                  </h3>
                  <div className="space-y-3">
                    {unit.contact_email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {unit.contact_email}
                        </span>
                      </div>
                    )}
                    {unit.contact_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {unit.contact_phone}
                        </span>
                      </div>
                    )}
                    {unit.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {unit.address}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card> */}
          {/* </div> */}
        </div>

        {/* Mission & Values Section */}
        <div className="md:mt-2.5 space-y-2.5">
          <Card className="border border-gray-200 rounded-none md:rounded-3xl">
            <CardContent className="p-7">
              <h2 className="text-xl font-medium text-gray-900 mb-5">
                Mission & Values
              </h2>

              {/* Our Mission */}
              <div className="mb-2.5 border border-gray-300 p-5 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground">
                  Our Mission
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {unit.mission ||
                    "To create meaningful impact through innovative solutions and sustainable practices."}
                </p>
              </div>
              {/* Our Values */}
              <div className="border  border-gray-300 p-5 rounded-xl">
                <h3 className="text-lg font-semibold text-foreground">
                  Our Values
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {unit.values ||
                    "To create meaningful impact through innovative solutions and sustainable practices."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Glimpse of the Unit & Gallery */}
        {(() => {
          const glimpseUrl = (unit as any).glimpse;
          const galleryImagesRaw = (unit as any).gallery_images;
          let galleryImages: string[] = [];

          try {
            if (typeof galleryImagesRaw === "string") {
              galleryImages = JSON.parse(galleryImagesRaw);
            } else if (Array.isArray(galleryImagesRaw)) {
              galleryImages = galleryImagesRaw;
            }
          } catch {
            galleryImages = [];
          }

          const hasVideo = glimpseUrl && typeof glimpseUrl === "string";
          const hasImages =
            Array.isArray(galleryImages) && galleryImages.length > 0;

          // If neither video nor images exist, return null
          if (!hasVideo && !hasImages) return null;

          // Show up to 3 images
          const displayImages = galleryImages.slice(0, 3);

          return (
            <Card className="md:mt-2.5 border-gray-200 rounded-none md:rounded-3xl">
              <CardContent className="p-7">
                <div className="flex items-center mb-5">
                  <h3 className="text-xl font-medium text-foreground">
                    Glimpse of the Unit
                  </h3>
                </div>

                {/* Show video only if available */}
                {hasVideo && (
                  <div className="relative w-full aspect-video bg-muted overflow-hidden mb-3">
                    <video
                      controls
                      className="w-full h-full object-cover"
                      preload="metadata"
                    >
                      <source src={glimpseUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Show gallery images if available */}
                {hasImages && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {displayImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square bg-muted overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Application Dialog */}
      {selectedInternship && (
        <ProfileSummaryDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          internship={selectedInternship}
          onSuccess={() => {
            setIsDialogOpen(false);
            setShowSuccessDialog(true);
          }}
        />
      )}

      {/* Success Dialog */}
      <ApplicationSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          setSelectedInternship(null);
        }}
      />
    </div>
  );
};

export default UnitView;
