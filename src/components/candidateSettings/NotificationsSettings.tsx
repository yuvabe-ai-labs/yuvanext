import { useState } from "react";
import { ChevronRight } from "lucide-react";
import NotificationToggle from "./NotificationToggle";

export default function NotificationSettings() {
  const [allowAll, setAllowAll] = useState(true);

  // null = main list, otherwise section key
  const [activeSubView, setActiveSubView] = useState(null);

  // notification state
  const [settings, setSettings] = useState({
    internship_updates: false,
    application_status: false,
    recommended_internship: false,
    similar_internships: false,
    recommended_courses: false,
  });

  const openSubView = (key) => {
    setActiveSubView(key);
  };

  const Row = ({ label, value, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between border-b border-gray-200"
    >
      <div className="text-start py-4 space-y-1">
        <p className="text-base">{label}</p>
        <p className="text-xs text-gray-500">{value ? "On" : "Off"}</p>
      </div>
      <ChevronRight className="text-gray-400" />
    </button>
  );

  //  SUB VIEW RENDERING (like your AccountPreferences)
  if (activeSubView) {
    return (
      <NotificationToggle
        title={activeSubView}
        value={settings[activeSubView]}
        onToggle={() =>
          setSettings((prev) => ({
            ...prev,
            [activeSubView]: !prev[activeSubView],
          }))
        }
        onBack={() => setActiveSubView(null)}
      />
    );
  }

  //  MAIN LIST VIEW
  return (
    <div className="">
      <h1 className="text-xl font-medium mb-5">Notification Settings</h1>

      {/* Allow receiving notifications */}
      <div className="flex justify-between mb-1 items-center">
        <h2 className="text-lg font-medium">Allow receiving notifications</h2>

        <label className="relative inline-flex cursor-pointer border border-gray-400 rounded-full">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={allowAll}
            onChange={() => setAllowAll(!allowAll)}
          />
          <div className="w-11 h-6 rounded-full peer-checked:bg-green-500 bg-gray-400 transition"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5"></div>
        </label>
      </div>

      {allowAll && (
        <div className="text-gray-600 font-medium">
          <Row
            label="Internship updates"
            value={settings.internship_updates}
            onClick={() => openSubView("internship_updates")}
          />
          <Row
            label="Application status"
            value={settings.application_status}
            onClick={() => openSubView("application_status")}
          />
          <Row
            label="Recommended Internship"
            value={settings.recommended_internship}
            onClick={() => openSubView("recommended_internship")}
          />
          <Row
            label="Similar Internships"
            value={settings.similar_internships}
            onClick={() => openSubView("similar_internships")}
          />
          <Row
            label="Recommended Courses"
            value={settings.recommended_courses}
            onClick={() => openSubView("recommended_courses")}
          />
        </div>
      )}
    </div>
  );
}
