// candidateSettingsSidebar;
import React from "react";

const items = [
  { id: "accountPreferences", label: "Account Preferences" },
  { id: "security", label: "Sign In & Security" },
  { id: "notifications", label: "Notifications" },
];

export default function Sidebar({ active, onChange }) {
  return (
    <nav aria-label="Settings navigation" className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.id}>
            <button
              onClick={() => onChange(it.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150
                ${
                  active === it.id
                    ? "bg-gray-100 text-blue-600 font-medium"
                    : "hover:bg-gray-50"
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
