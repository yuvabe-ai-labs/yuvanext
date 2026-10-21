import { useNavigate } from "react-router-dom";
import { Building2, ChevronDown, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/YuvaNext.svg";
import logoName from "@/assets/YuvaNext_name.svg";

const itemClassName =
  "cursor-pointer hover:!text-blue-500 hover:bg-transparent focus:bg-transparent transition-colors [&_svg]:hover:!text-blue-500";

// Header for guest-facing pages; Navbar can't be used here because it
// fetches the profile, and a 401 from that forces a sign-out redirect.
const PublicHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="border-b border-gray-200 bg-background">
      <div className="container flex items-center justify-between px-4 py-3 md:px-8 lg:px-[7.5rem]">
        <a href="/">
          <img
            src={logoName}
            className="h-10 w-auto block md:hidden"
            alt="Mobile Logo"
          />
          <img
            src={logo}
            className="h-12 w-auto hidden md:block"
            alt="Desktop Logo"
          />
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="gradient" className="rounded-full text-white">
              Sign in
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-lg">
            <DropdownMenuItem
              onClick={() => navigate("/auth/candidate/signin")}
              className={itemClassName}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              <span>Candidate</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/auth/unit/signin")}
              className={itemClassName}
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>Unit</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default PublicHeader;
