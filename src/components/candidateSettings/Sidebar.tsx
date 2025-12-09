// candidateSettingsSidebar;
import React from "react";

const items = [
  { id: "accountPreferences", label: "Account Preferences" },
  { id: "security", label: "Sign In & Security" },
  { id: "notifications", label: "Notifications" },
];

export default function Sidebar({ active, onChange }) {
  return (
    <nav aria-label="Settings navigation">
      <h2 className="text-xl font-medium text-gray-600 p-5">Settings</h2>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <button
              onClick={() => onChange(it.id)}
              className={`w-full text-left font-medium px-7 border-b border-gray-200 py-5 transition-colors duration-150
                ${
                  active === it.id
                    ? "bg-gray-100 text-blue-500 font-medium"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              aria-current={active === it.id ? "true" : undefined}
            >
              {it.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
