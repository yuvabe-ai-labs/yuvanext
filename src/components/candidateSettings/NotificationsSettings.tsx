import React from "react";

export default function NotificationsSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>

      <div className="space-y-4">
        <div className="border p-4 rounded">
          <label className="flex items-center justify-between">
            <span className="text-sm">Email notifications</span>
            <input type="checkbox" aria-label="email notifications" />
          </label>
        </div>

        <div className="border p-4 rounded">
          <label className="flex items-center justify-between">
            <span className="text-sm">SMS notifications</span>
            <input type="checkbox" aria-label="sms notifications" />
          </label>
        </div>
      </div>
    </div>
  );
}
