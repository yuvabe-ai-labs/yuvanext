import { useSession } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, HelpCircle, Info } from "lucide-react";
import { CircularProgress } from "@/components/CircularProgress";
import { useProfile } from "@/hooks/useProfile";
import { useSaveAndAppliedCount } from "@/hooks/useInternships";

interface ProfileSidebarProps {
  savedCount?: number;
}

const ProfileSidebar = ({ savedCount = 0 }: ProfileSidebarProps) => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: countsData } = useSaveAndAppliedCount();

  const profileCompletion = profile?.profileScore || 0;
  const appliedCount = countsData?.appliedCount || 0;
  const savedCountFromApi = countsData?.savedCount || savedCount;

  return (
    <div className="w-full max-w-sm">
      {/* Profile Card */}
      <Card className="p-6 bg-white shadow-sm border border-gray-200 rounded-3xl">
        {/* Profile Info Section */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <CircularProgress
                percentage={profileCompletion}
                size={90}
                strokeWidth={3}
              >
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={profile?.avatarUrl || profile?.image || ""}
                  />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {profile?.name?.charAt(0) ||
                      session?.user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </CircularProgress>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {profile?.name}
              </h3>
              <p className="text-sm text-gray-500">{profile?.role}</p>
            </div>

            <Button
              className="bg-gradient-to-br from-[#C94100] to-[#FFB592] hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </Button>
          </div>
        </div>

        {/* Profile Performance Section */}
        <Card className="p-6 bg-white shadow-sm border border-gray-200 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Profile Performance</h4>
            <Info className="w-4 h-4 text-gray-800" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-base text-gray-600 mb-1 flex justify-center">
                Applied
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="text-2xl font-semibold text-gray-600">
                  {appliedCount}
                </div>

                {/* need to implement in future */}
                {/* <ChevronRight className="w-4 h-4 text-gray-400" /> */}
              </div>
            </div>

            {/* Divider */}
            <div className="h-full w-px bg-gray-300 mx-auto"></div>

            <div>
              <p className="text-base text-gray-600 mb-1 flex justify-center">
                Saved
              </p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-semibold text-gray-600">
                  {savedCountFromApi}
                </span>

                {/* need to implement in future */}
                {/* <ChevronRight className="w-4 h-4 text-gray-400" /> */}
              </div>
            </div>
          </div>

          {/* AI Resume Builder Prompt */}

          {/* need to implement in future */}
          {/* <Card className="bg-gradient-to-br from-[#07636C] to-[#0694A2]  text-white p-4 rounded-xl border-0">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M16.051 12.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.866l-1.156-1.153a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
                    <path d="M8 15H7a4 4 0 0 0-4 4v2" />
                    <circle cx="10" cy="7" r="4" />
                  </svg>{" "}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-5">
                  Get noticed by top Units with a resume built by AI Resume
                  Builder
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </div>
          </Card> */}
        </Card>
      </Card>
    </div>
  );
};

export default ProfileSidebar;
