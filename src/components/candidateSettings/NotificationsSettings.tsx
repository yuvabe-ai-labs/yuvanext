import { useState } from "react";
import { ChevronRight } from "lucide-react";
import NotificationToggle from "./NotificationToggle";

export default function NotificationsSettings() {
  const [allowAll, setAllowAll] = useState(true);
  const [activeSubView, setActiveSubView] = useState(null);

  // Updated state structure to support the UI requirements
  const [settings, setSettings] = useState({
    internship_updates: { inApp: true, email: false },
    application_status: { inApp: true, email: true },
    recommended_internship: { inApp: false, email: true },
    similar_internships: { inApp: true, email: false },
    recommended_courses: { inApp: false, email: false },
  });

  // Descriptions map to match the specific text in your design
  const descriptions = {
    internship_updates:
      "Get notified when updates happen to internships you are following.",
    application_status: "Receive updates when your application status changes.",
    recommended_internship:
      "These are notifications that newly-posted internships match your skills.",
    similar_internships:
      "Get suggestions for internships similar to those you've viewed.",
    recommended_courses:
      "Suggestions for courses that can help you improve your skills.",
  };

  const openSubView = (key) => {
    setActiveSubView(key);
  };

  const handleSubToggle = (key, type) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [type]: !prev[key][type],
      },
    }));
  };

  const Row = ({ label, settingsObj, onClick }) => {
    // If either inApp or Email is true, we consider it "On" for the summary view
    const isOn = settingsObj.inApp || settingsObj.email;

    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-md"
      >
        <div className="text-start py-4 space-y-1">
          <p className="text-base text-gray-800">{label}</p>
          <p className="text-xs text-gray-500">{isOn ? "On" : "Off"}</p>
        </div>
        <ChevronRight className="text-gray-400" size={20} />
      </button>
    );
  };

  // SUB VIEW RENDERING
  if (activeSubView) {
    return (
      <NotificationToggle
        title={activeSubView}
        description={descriptions[activeSubView]}
        values={settings[activeSubView]}
        onToggle={(type) => handleSubToggle(activeSubView, type)}
        onBack={() => setActiveSubView(null)}
      />
    );
  }

  // MAIN LIST VIEW
  return (
    <div className="">
      <h1 className="text-xl font-medium mb-5 text-gray-900">
        Notification Settings
      </h1>

      {/* Global Toggle */}
      <div className="flex justify-between mb-6 items-center">
        <h2 className="text-lg font-medium text-gray-800">
          Allow receiving notifications
        </h2>

        <label className="relative inline-flex cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={allowAll}
            onChange={() => setAllowAll(!allowAll)}
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition-colors duration-200 ease-in-out"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-sm"></div>
        </label>
      </div>

      {allowAll && (
        <div className="text-gray-600 font-medium">
          <Row
            label="Internship updates"
            settingsObj={settings.internship_updates}
            onClick={() => openSubView("internship_updates")}
          />
          <Row
            label="Application status"
            settingsObj={settings.application_status}
            onClick={() => openSubView("application_status")}
          />
          <Row
            label="Recommended Internship"
            settingsObj={settings.recommended_internship}
            onClick={() => openSubView("recommended_internship")}
          />
          <Row
            label="Similar Internships"
            settingsObj={settings.similar_internships}
            onClick={() => openSubView("similar_internships")}
          />
          <Row
            label="Recommended Courses"
            settingsObj={settings.recommended_courses}
            onClick={() => openSubView("recommended_courses")}
          />
        </div>
      )}
    </div>
  );
}
