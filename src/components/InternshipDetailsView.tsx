import {
  ArrowLeft,
  MapPin,
  Clock,
  IndianRupee,
  Check,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

interface InternshipDetailsViewProps {
  internship: any;
  onClose: () => void;
}

const InternshipDetailsView = ({
  internship,
  onClose,
}: InternshipDetailsViewProps) => {
  // Safe JSON parser
  const safeParse = (data: any, fallback: any) => {
    if (!data) return fallback;
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return fallback;
    }
  };

  const responsibilities = safeParse(internship.responsibilities, []);
  const requirements = safeParse(internship.requirements, []);
  const skills = safeParse(internship.skills_required, []);
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
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
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
                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-500" />
                    {internshipData.location || "Not specified"}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-500" />
                    {internshipData.duration || "Not specified"}
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="w-4 h-4 mr-1.5 text-gray-500" />
                    {internshipData.payment
                      ? `Paid - ${internshipData.payment}`
                      : "Unpaid"}
                  </div>
                  <div className="flex items-center">
                    {internshipData.job_type === "full_time"
                      ? "Full Time"
                      : internshipData.job_type === "part_time"
                      ? "Part Time"
                      : internshipData.job_type === "both"
                      ? "Full Time & Part Time"
                      : "Not specified"}
                  </div>
                  {/* Minimum Age */}
                  {internshipData.min_age_required && (
                    <div className="flex items-center">
                      Minimum Age: {internshipData.min_age_required}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <p
                className={`mb-4 flex items-center gap-2 ${
                  internshipData.status === "active"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {internshipData.status === "active" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                {internshipData.status === "active"
                  ? "Active Application"
                  : "Closed Application"}
              </p>
            </div>
          </div>

          {/* Job Type & Min Age (TOP SECTION) */}
          {/* <div className="mb-8 flex flex-wrap items-center gap-4">
            {internshipData.job_type && (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Engagement Type:
                </h3>
                {internshipData.job_type === "both" ? (
                  <>
                    <Badge className="bg-blue-100 text-blue-700 font-medium">
                      Part-Time
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 font-medium">
                      Full-Time
                    </Badge>
                  </>
                ) : (
                  <Badge
                    className={`${
                      internshipData.job_type === "part-time"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    } font-medium`}
                  >
                    {internshipData.job_type === "part-time"
                      ? "Part-Time"
                      : "Full-Time"}
                  </Badge>
                )}
              </div>
            )}

            {internshipData.min_age_required && (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Minimum Age:
                </h3>
                <p className="text-gray-700 text-base">
                  {internshipData.min_age_required}
                </p>
              </div>
            )}
          </div> */}

          {/* About the Internship */}
          <div className="border-t border-gray-200 mb-8"></div>
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
            <>
              <div className="border-t border-gray-200 mb-8"></div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Key Responsibilities
                </h2>
                <div className="space-y-3">
                  {internshipData.responsibilities.map(
                    (responsibility: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mt-0.5">
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
            </>
          )}

          {/* Requirements */}
          {internshipData.requirements.length > 0 && (
            <>
              <div className="border-t border-gray-200 mb-8"></div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Requirements from the Candidates
                </h2>
                <div className="space-y-3">
                  {internshipData.requirements.map(
                    (requirement: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mt-0.5">
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
            </>
          )}

          {/* Benefits */}
          {internshipData.benefits.length > 0 && (
            <>
              <div className="border-t border-gray-200 mb-8"></div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  What You Will Get
                </h2>
                <div className="space-y-3">
                  {internshipData.benefits.map(
                    (benefit: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {benefit}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}

          {/* Skills Required */}
          {internshipData.skills.length > 0 && (
            <>
              <div className="border-t border-gray-200 mb-8"></div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Required Skills
                </h2>
                <div className="space-y-3">
                  {internshipData.skills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <p className="text-gray-700 leading-relaxed">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Additional Info */}
          <div className="border-t border-gray-200 mb-8"></div>
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
