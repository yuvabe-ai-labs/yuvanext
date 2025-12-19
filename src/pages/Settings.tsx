import Navbar from "@/components/Navbar";
import { useState } from "react";
import Sidebar from "@/components/candidateSettings/Sidebar";
import AccountPreferences from "@/components/candidateSettings/AccountPreferences";
import SecuritySettings from "@/components/candidateSettings/SecuritySettings";
import NotificationsSettings from "@/components/candidateSettings/NotificationsSettings";

/**
 * Top-level Settings App — no route required.
 * Two-level state:
 * - activeSection -> which sidebar section is active
 * - AccountPreferences handles its own sub view -> menu or sub pages
 */
export default function Settings() {
  const [activeSection, setActiveSection] = useState("accountPreferences");

  const renderContent = () => {
    switch (activeSection) {
      case "accountPreferences":
        return <AccountPreferences />;
      case "security":
        return <SecuritySettings />;
      case "notifications":
        return <NotificationsSettings />;
      default:
        return <AccountPreferences />;
    }
  };

  return (
    <div className="bg-[#F8F9FA]">
      <Navbar />
      <div className="flex mx-[120px] bg-white">
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r-2 md:border-gray-200 ">
          <Sidebar active={activeSection} onChange={setActiveSection} />
        </aside>

        <section className="flex-1 p-10">{renderContent()}</section>
      </div>
    </div>
  );
}
