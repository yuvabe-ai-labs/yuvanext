import React from "react";

/** placeholder security settings page */
export default function SecuritySettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sign In & Security</h2>
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <div className="text-sm font-medium">Password</div>
          <div className="text-sm text-gray-500 mt-1">Change your password</div>
          <div className="mt-3">
            <button className="px-3 py-1 bg-blue-600 text-white rounded">
              Change
            </button>
          </div>
        </div>

        <div className="border p-4 rounded">
          <div className="text-sm font-medium">Two-factor authentication</div>
          <div className="text-sm text-gray-500 mt-1">
            Enable 2FA to improve account security
          </div>
        </div>
      </div>
    </div>
  );
}
