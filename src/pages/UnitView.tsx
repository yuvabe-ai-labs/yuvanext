import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useUnitById } from "@/hooks/useUnits";
import { useSession } from "@/lib/auth-client";
import ApplicationSuccessDialog from "@/components/ApplicationSuccessDialog";
import ProfileSummaryDialog from "@/components/ProfileSummaryDialog";
import type { Internship } from "@/types/internships.types";
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
  const { data: session } = useSession();
  const { data: unit, isLoading, error } = useUnitById(id || "");

  const [selectedInternship, setSelectedInternship] =
    useState<Internship | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleApply = (internship: Internship) => {
    setSelectedInternship(internship);
    setIsDialogOpen(true);
  };

  if (isLoading) {
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
            {error instanceof Error
              ? error.message
              : "The unit you are looking for does not exist."}
          </p>
          <Button onClick={() => navigate("/units")}>Back to Units</Button>
        </div>
      </div>
    );
  }

  const recentProjects = safeParse(unit.projects, []);
  const internships = unit.internships || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative h-[17.625rem] bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        {unit.bannerUrl && (
          <img
            src={unit.bannerUrl}
            alt={unit.name || "Unit"}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Centered Content Wrapper */}
<div className="max-w-4xl mx-auto space-y-2.5 px-4 md:px-0">
  
  {/* Main Content: Open Internship Positions */}
  <div className="border border-gray-200 p-8 rounded-none md:rounded-3xl bg-white">
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
          const skillsRequired = internship.skillsRequired || [];
          return (
            <Card
              key={internship.id}
              className="border-[0.5px] border-gray-300 rounded-xl hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2.5">
                        <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
                          {unit.avatarUrl ? (
                            <img className="w-12 h-12 rounded-full" src={unit.avatarUrl} alt="logo" />
                          ) : (
                            <span className="text-lg font-bold">{internship.title.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{internship.title}</h3>
                          {internship.duration && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{internship.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="gradient"
                        className="rounded-full text-white hidden md:flex cursor-pointer"
                        onClick={() => navigate(`/internships/${internship.id}`)}
                      >
                        View
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {internship.description}
                    </p>
                    {skillsRequired.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">Skills:</span>
                        {skillsRequired.slice(0, 5).map((skill: string, idx: number) => (
                          <span key={idx} className="text-xs text-muted-foreground">
                            {skill}{idx < Math.min(skillsRequired.length, 5) - 1 && ","}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    )}
  </div>

  {/* Mission & Values Section */}
  <Card className="border border-gray-200 rounded-none md:rounded-3xl">
    <CardContent className="p-7">
      <h2 className="text-xl font-medium text-gray-900 mb-5">Mission & Values</h2>
      <div className="mb-2.5 border border-gray-300 p-5 rounded-xl">
        <h3 className="text-lg font-semibold text-foreground">Our Mission</h3>
        <p className="text-gray-500 leading-relaxed">
          {unit.mission || "To create meaningful impact through innovative solutions."}
        </p>
      </div>
      <div className="border border-gray-300 p-5 rounded-xl">
        <h3 className="text-lg font-semibold text-foreground">Our Values</h3>
        <p className="text-gray-500 leading-relaxed">
          {unit.values || "Sustainability, Innovation, and Excellence."}
        </p>
      </div>
    </CardContent>
  </Card>

  {/* Glimpse of the Unit & Gallery */}
  {(() => {
    const galleryVideos = unit.galleryVideos || [];
    const galleryImages = unit.galleryImages || [];
    if (galleryVideos.length === 0 && galleryImages.length === 0) return null;

    return (
      <Card className="border-gray-200 rounded-none md:rounded-3xl">
        <CardContent className="p-7">
          <h3 className="text-xl font-medium text-foreground mb-5">Glimpse of the Unit</h3>
          {galleryVideos.length > 0 && (
            <div className="relative w-full aspect-video bg-muted overflow-hidden mb-3">
              <video controls className="w-full h-full object-cover">
                <source src={galleryVideos[0]} type="video/mp4" />
              </video>
            </div>
          )}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5">
              {galleryImages.slice(0, 3).map((imageUrl, index) => (
                <div key={index} className="relative aspect-square bg-muted overflow-hidden">
                  <img src={imageUrl} alt="Gallery" className="w-full h-full object-cover" />
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
