import {
  Search,
  Menu,
  CircleUserRound,
  FileText,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import logo from "@/assets/YuvaNext.svg";
import logoName from "@/assets/YuvaNext_name.svg";
import { Disc } from "@/components/ui/custom-icons";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const allNavItems = [
    { name: "Internships", path: "/internships" },
    { name: "Courses", path: "/courses" },
    { name: "Units", path: "/units" },
  ];

  const navItems = userRole === "unit" ? [] : allNavItems;
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();

    if (userRole === "unit") {
      navigate("/auth/unit/signin");
    } else {
      navigate("/auth/candidate/signin");
    }

    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (userRole === "unit") {
      navigate("/unit-profile");
    } else {
      navigate("/profile");
    }
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // ✅ Dynamic dashboard link based on role
  const dashboardLink = userRole === "unit" ? "/unit-dashboard" : "/dashboard";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 shadow-sm">
        <div className="container h-16 px-4 sm:px-6 md:px-8 lg:px-20 flex items-center relative justify-between">
          {/* Logo */}
          <div className="flex w-full items-center ">
            <div className="lg:hidden p-3 items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <div className="flex items-center justify-between rounded-full pl-2 sm:pl-3 pr-1 gap-1 sm:gap-2 py-1.5 shadow-sm w-fit">
                  <div className="flex flex-col justify-center space-y-[3px] m-1.5">
                    <div className="h-[3px] w-3 bg-gray-500 rounded-full self-start"></div>
                    <div className="h-[3px] w-[26px] bg-gray-500 rounded-full mx-auto"></div>
                    <div className="h-[3px] w-3 bg-gray-500 rounded-full self-end"></div>
                  </div>
                </div>
              </Button>
            </div>

            {/* ✅ Updated link based on userRole */}
            <a href={dashboardLink}>
              {/* Mobile Logo */}
              <img
                src={logoName}
                className="h-10 w-auto cursor-pointer block md:hidden"
                alt="Mobile Logo"
              />

              {/* Desktop Logo */}
              <img
                src={logo}
                className="h-12 w-auto cursor-pointer hidden md:block"
                alt="Desktop Logo"
              />
            </a>
          </div>

          {/* Navigation Links - Desktop Only */}
          {navItems.length > 0 && (
            <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-6 xl:space-x-10">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={`text-sm font-medium ${
                    isActive(item.path)
                      ? "text-primary rounded-none"
                      : "text-black"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto lg:ml-0">
            <NotificationDropdown />

            {/* User Avatar with Dropdown - Desktop */}
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-between bg-[var(--indigo-50,#F0F5FF)] rounded-full pl-2 sm:pl-3 pr-1 gap-1 sm:gap-2 py-1.5 shadow-sm w-fit">
                    <div className="flex flex-col justify-center space-y-[3px] m-1.5">
                      <div className="h-[3px] w-3 bg-gray-500 rounded-full self-start"></div>
                      <div className="h-[3px] w-[26px] bg-gray-500 rounded-full mx-auto"></div>
                      <div className="h-[3px] w-3 bg-gray-500 rounded-full self-end"></div>
                    </div>

                    <Avatar className="h-10 w-10 border-1 border-white shadow-md">
                      <AvatarImage
                        src={avatarUrl || undefined}
                        alt={user?.email || "User"}
                      />
                      <AvatarFallback className="text-sm bg-[#F8F6F2] text-gray-800">
                        {user?.email?.charAt(0).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-lg">
                  <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="cursor-pointer hover:!text-blue-500 hover:bg-transparent focus:bg-transparent transition-colors [&_svg]:hover:!text-blue-500"
                  >
                    <CircleUserRound className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  {userRole === "student" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/candidate-tasks")}
                      className="cursor-pointer hover:!text-blue-500 hover:bg-transparent focus:bg-transparent transition-colors [&_svg]:hover:!text-blue-500"
                    >
                      <Disc className="mr-2 h-4 w-4" />
                      <span>Applications</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => navigate("")}
                    className="cursor-pointer hover:!text-blue-500 hover:bg-transparent focus:bg-transparent transition-colors [&_svg]:hover:!text-blue-500"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Feedbacks</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("")}
                    className="cursor-pointer hover:!text-blue-500 hover:bg-transparent focus:bg-transparent transition-colors [&_svg]:hover:!text-blue-500"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer hover:!text-blue-500 hover:bg-transparent focus:bg-transparent transition-colors [&_svg]:hover:!text-blue-500"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-600 focus:bg-transparent focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden border-t px-4 py-3 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search"
                className="pl-10 w-full bg-white border border-gray-300 rounded-full"
                autoFocus
              />
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-16 bottom-0 w-72 bg-white shadow-xl overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* User Section */}
              <div className="p-6 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-gray-200">
                    <AvatarImage
                      src={avatarUrl || undefined}
                      alt={user?.email || "User"}
                    />
                    <AvatarFallback className="text-sm bg-[#F8F6F2] text-gray-800">
                      {user?.email?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userRole || "Guest"}
                    </p>
                  </div>
                </div>
              </div>

              {navItems.length > 0 && (
                <div className="py-2 border-b">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? "text-primary bg-blue-50"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 py-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <CircleUserRound className="mr-3 h-5 w-5 text-gray-400" />
                  My Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center justify-center"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
