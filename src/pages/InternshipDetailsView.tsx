import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Share,
  Check,
  X,
  Bell,
  Menu,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface InternshipDetailsViewProps {
  internship;
  onClose: () => void;
}

const InternshipDetailsView = ({
  internship,
  onClose,
}: InternshipDetailsViewProps) => {
  // Parse JSON fields safely
  const safeParse = (data, fallback) => {
    if (!data) return fallback;
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return fallback;
    }
  };

  const responsibilities = safeParse(internship.responsibilities, []);
  const requirements = safeParse(internship.requirements, []);
  const skills = safeParse(internship.skills, []);
  const benefits = safeParse(internship.benefits, []);

  const internshipData = {
    ...internship,
    responsibilities,
    requirements,
    skills,
    benefits,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Same style as InternshipApplicants */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full"></div>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search"
                className="pl-10 bg-muted/30 border-muted"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 bg-orange-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-teal-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Back Button and Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Edit JD
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4 mr-1" />
              Close Application
            </Button>
          </div>
        </div>

        {/* Job Description Content in Card */}
        <div className="bg-card rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start space-x-5">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-sm">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {internshipData.title}
                </h1>
                <p className="text-lg text-gray-700 mb-3 font-medium">
                  {internshipData.company_name}
                </p>
                <div className="flex items-center space-x-5 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-500" />
                    {internshipData.location || "Not specified"}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                    {internshipData.duration || "Not specified"}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1.5 text-gray-500" />
                    {internshipData.payment || "Not specified"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1.5 px-4 py-2"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1.5 px-4 py-2"
              >
                <Share className="w-4 h-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>

          {/* About the Internship */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              About the Internship
            </h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {internshipData.description || "No description provided."}
            </div>
          </div>

          {/* Key Responsibilities */}
          {internshipData.responsibilities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Key Responsibilities
              </h2>
              <div className="space-y-3">
                {internshipData.responsibilities.map(
                  (responsibility: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {responsibility}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Requirements */}
          {internshipData.requirements.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Requirements from the Candidates
              </h2>
              <div className="space-y-3">
                {internshipData.requirements.map(
                  (requirement: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {requirement}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Skills Required */}
          {internshipData.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {internshipData.skills.map((skill: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 px-3 py-1.5"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {internshipData.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                What You Will Get
              </h2>
              <div className="space-y-3">
                {internshipData.benefits.map(
                  (benefit: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <p className="text-gray-700 leading-relaxed">{benefit}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {internshipData.application_deadline && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Application Deadline
                </h3>
                <p className="text-gray-700">
                  {new Date(
                    internshipData.application_deadline
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

            {internshipData.company_email && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Contact
                </h3>
                <p className="text-gray-700">{internshipData.company_email}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default InternshipDetailsView;
