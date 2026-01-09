import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import NotificationToggle from "./NotificationToggle";
import { notificationSchema } from "@/lib/schemas";

// 1. NEW IMPORTS
import { useUnitProfile } from "@/hooks/useUnitProfile";
import { useUpdateNotifications } from "@/hooks/useSettings";

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function NotificationsSettings() {
  // 2. USE REACT QUERY HOOKS
  // Fetch current settings via profile
  const { data: profile, isLoading: loading } = useUnitProfile();
  // Mutation to update settings
  const updateMutation = useUpdateNotifications();

  const [activeSubView, setActiveSubView] = useState<string | null>(null);

  const { getValues, setValue, reset } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      allow_all: false,
      application_status_in_app: false,
      application_status_email: false,
    },
  });

  /* ---------- INIT ---------- */
  useEffect(() => {
    if (!profile) return;

    // 3. MAP BACKEND (CamelCase) TO FORM (snake_case)
    // Backend: emailNotificationsEnabled, inAppNotificationsEnabled
    const emailEnabled = profile.emailNotificationsEnabled || false;
    const inAppEnabled = profile.inAppNotificationsEnabled || false;

    // Derived 'allow_all' state
    const allowAll = emailEnabled || inAppEnabled;

    reset({
      allow_all: allowAll,
      application_status_in_app: inAppEnabled,
      application_status_email: emailEnabled,
    });
  }, [profile, reset]);

  /* ---------- HELPER: SYNC TO BACKEND ---------- */
  const syncToBackend = (data: NotificationFormData) => {
    updateMutation.mutate({
      // Map Form (snake_case) -> Backend (CamelCase)
      emailNotificationsEnabled: data.application_status_email,
      inAppNotificationsEnabled: data.application_status_in_app,
    });
  };

  /* ---------- GLOBAL TOGGLE ---------- */
  const handleAllowAllToggle = async () => {
    const next = !getValues("allow_all");

    const payload: NotificationFormData = {
      allow_all: next,
      application_status_in_app: next,
      application_status_email: next,
    };

    reset(payload); // Optimistic UI update
    syncToBackend(payload);
  };

  /* ---------- SUB TOGGLE ---------- */
  const handleSubToggle = async (type: "inApp" | "email") => {
    const key =
      type === "inApp"
        ? "application_status_in_app"
        : "application_status_email";

    const nextValue = !getValues(key);

    setValue(key, nextValue);

    const inApp =
      type === "inApp" ? nextValue : getValues("application_status_in_app");

    const email =
      type === "email" ? nextValue : getValues("application_status_email");

    const allowAll = inApp || email;

    setValue("allow_all", allowAll);

    // Sync with backend
    syncToBackend({
      allow_all: allowAll,
      application_status_in_app: inApp,
      application_status_email: email,
    });
  };

  /* ---------- UI STATES ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Fallback if profile fails to load (optional)
  // if (!profile) return ...

  /* ---------- SUB VIEW ---------- */
  if (activeSubView) {
    return (
      <NotificationToggle
        title="application_status"
        description="Receive updates when your application status changes."
        values={{
          inApp: getValues("application_status_in_app"),
          email: getValues("application_status_email"),
        }}
        onToggle={handleSubToggle}
        onBack={() => setActiveSubView(null)}
      />
    );
  }

  /* ---------- MAIN VIEW (OLD UI) ---------- */
  const isOn =
    getValues("application_status_in_app") ||
    getValues("application_status_email");

  return (
    <div>
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
            checked={getValues("allow_all")}
            onChange={handleAllowAllToggle}
            disabled={updateMutation.isPending}
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
        </label>
      </div>

      {getValues("allow_all") && (
        <button
          onClick={() => setActiveSubView("application_status")}
          className="w-full flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-md"
        >
          <div className="text-start py-4 space-y-1">
            <p className="text-base text-gray-800">Application status</p>
            <p className="text-xs text-gray-500">{isOn ? "On" : "Off"}</p>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
        </button>
      )}
    </div>
  );
}
