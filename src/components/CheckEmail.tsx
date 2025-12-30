import { Link } from "react-router-dom";
import emailSentIcon from "@/assets/email-sent-icon.png";
import { ArrowLeft } from "lucide-react";

const CheckEmail = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-[474px]">
        <div
          className="bg-white rounded-[15px] px-[87px] py-16 w-full"
          style={{ boxShadow: "0px 2px 25px rgba(0, 0, 0, 0.15)" }}
        >
          {/* Email Icon */}
          <div className="flex justify-center mb-8">
            <img
              src={emailSentIcon}
              alt="Email sent"
              className="w-[120px] h-[120px]"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-[20px] font-medium leading-[35px] mb-3"
              style={{
                color: "#1F2A37",
                fontFamily:
                  "'Neue Haas Grotesk Text Pro', system-ui, sans-serif",
              }}
            >
              Check your email
            </h1>
            <p
              className="text-[12px] leading-[18px]"
              style={{
                color: "#9CA3AF",
                fontFamily:
                  "'Neue Haas Grotesk Text Pro', system-ui, sans-serif",
              }}
            >
              We have sent a password reset link to your email
            </p>
          </div>

          {/* Back to Sign In */}
          <Link
            to="/auth/student/signin"
            className="w-full h-[30px] rounded-lg flex items-center justify-center text-[12px] font-medium text-white hover:opacity-90 transition-colors gap-2"
            style={{ backgroundColor: "#76A9FA" }}
          >
            <ArrowLeft size={14} />
            Back to Sign In page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
