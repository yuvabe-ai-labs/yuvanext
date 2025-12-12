import { ChevronLeft } from "lucide-react";

export default function NotificationToggle({
  title,
  description,
  values, // Expecting object: { inApp: boolean, email: boolean }
  onToggle, // Expecting function: (type) => void
  onBack,
}) {
  const formattedTitle = title.replaceAll("_", " ");

  // Helper component for the individual toggle rows
  const ToggleRow = ({ label, subLabel, isChecked, onChange }) => (
    <div className="flex justify-between items-center py-4 border-b border-gray-200">
      <div className="space-y-1">
        <p className="text-base font-medium text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{subLabel}</p>
      </div>

      <label className="relative inline-flex cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isChecked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition-colors duration-200 ease-in-out"></div>
        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-sm"></div>
      </label>
    </div>
  );

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-base text-gray-600 font-medium flex items-center gap-1 hover:text-gray-900 mb-6 transition-colors"
      >
        <ChevronLeft size={20} /> Back
      </button>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-xl text-gray-900 font-semibold mb-2 capitalize">
          {formattedTitle}
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          {description ||
            `Manage your preferences for ${formattedTitle.toLowerCase()}.`}
        </p>
      </div>

      {/* Toggles Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Choose where you get notified
        </h2>

        <div className="border-t border-gray-200">
          <ToggleRow
            label="In-app notifications"
            subLabel="Delivered inside the app"
            isChecked={values.inApp}
            onChange={() => onToggle("inApp")}
          />
          <ToggleRow
            label="Email Notifications"
            subLabel="Sent on your primary email"
            isChecked={values.email}
            onChange={() => onToggle("email")}
          />
        </div>
      </div>
    </div>
  );
}
