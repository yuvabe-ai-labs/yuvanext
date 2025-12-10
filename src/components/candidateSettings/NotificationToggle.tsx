import { ChevronLeft } from "lucide-react";

export default function NotificationToggle({ title, value, onToggle, onBack }) {
  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-base text-gray-600 font-medium flex items-center gap-1  hover:text-gray-900 mb-6"
      >
        <ChevronLeft /> Back
      </button>

      <h1 className="text-xl text-gray-800 font-medium mb-5 capitalize">
        {title.replaceAll("_", " ")}
      </h1>
      <p>
        These are notifications that matches you {title.replaceAll("_", " ")}.
      </p>

      <div className="flex justify-between items-center py-4 border-b border-gray-200">
        <p className="text-base text-gray-800">Enable notification</p>

        <label className="relative inline-flex cursor-pointer border border-gray-400 rounded-full">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={value}
            onChange={onToggle}
          />
          <div className="w-11 h-6 bg-gray-400 rounded-full peer-checked:bg-green-500 transition"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-5"></div>
        </label>
      </div>
    </div>
  );
}
