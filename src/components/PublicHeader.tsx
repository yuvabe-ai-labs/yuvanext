import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/YuvaNext.svg";
import logoName from "@/assets/YuvaNext_name.svg";

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
        <Button
          variant="gradient"
          className="rounded-full text-white"
          onClick={() => navigate("/auth/candidate/signin")}
        >
          Sign in
        </Button>
      </div>
    </header>
  );
};

export default PublicHeader;
