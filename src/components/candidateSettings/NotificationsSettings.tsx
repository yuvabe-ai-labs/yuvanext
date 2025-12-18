import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import NotificationToggle from "./NotificationToggle";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { notificationSchema } from "@/lib/schemas";

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function NotificationsSettings() {
  const { preferences, loading, updatePreferences } =
    useNotificationPreferences();
  const [activeSubView, setActiveSubView] = useState<string | null>(null);

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      allow_all: false,
      application_status_in_app: false,
      application_status_email: false,
      internship_updates_in_app: false,
      internship_updates_email: false,
      recommended_internship_in_app: false,
      recommended_internship_email: false,
      similar_internships_in_app: false,
      similar_internships_email: false,
      recommended_courses_in_app: false,
      recommended_courses_email: false,
    },
  });

  // Watch all form values
  const formValues = watch();

  // Descriptions map
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

  // Initialize form with preferences
  useEffect(() => {
    if (preferences) {
      reset({
        allow_all: preferences.allow_all,
        application_status_in_app: preferences.application_status_in_app,
        application_status_email: preferences.application_status_email,
        internship_updates_in_app: preferences.internship_updates_in_app,
        internship_updates_email: preferences.internship_updates_email,
        recommended_internship_in_app:
          preferences.recommended_internship_in_app,
        recommended_internship_email: preferences.recommended_internship_email,
        similar_internships_in_app: preferences.similar_internships_in_app,
        similar_internships_email: preferences.similar_internships_email,
        recommended_courses_in_app: preferences.recommended_courses_in_app,
        recommended_courses_email: preferences.recommended_courses_email,
      });
    }
  }, [preferences, reset]);

  const openSubView = (key: string) => {
    setActiveSubView(key);
  };

  const handleSubToggle = async (key: string, type: "inApp" | "email") => {
    const prefKey = type === "inApp" ? `${key}_in_app` : `${key}_email`;
    const currentValue = formValues[prefKey as keyof NotificationFormData];

    setValue(prefKey as keyof NotificationFormData, !currentValue, {
      shouldDirty: true,
    });

    // Auto-save
    await updatePreferences({ [prefKey]: !currentValue });
  };

  const handleAllowAllToggle = async () => {
    const newAllowAllValue = !formValues.allow_all;

    // If turning off allow_all, turn off all notification preferences
    if (!newAllowAllValue) {
      const allOffData: NotificationFormData = {
        allow_all: false,
        application_status_in_app: false,
        application_status_email: false,
        internship_updates_in_app: false,
        internship_updates_email: false,
        recommended_internship_in_app: false,
        recommended_internship_email: false,
        similar_internships_in_app: false,
        similar_internships_email: false,
        recommended_courses_in_app: false,
        recommended_courses_email: false,
      };

      // Update form values
      reset(allOffData);

      // Update backend
      await updatePreferences(allOffData);
    } else {
      // If turning on allow_all, just toggle the allow_all flag
      setValue("allow_all", true, { shouldDirty: true });
      await updatePreferences({ allow_all: true });
    }
  };

  const Row = ({ label, settingsObj, onClick }: any) => {
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load notification preferences</p>
      </div>
    );
  }

  // SUB VIEW RENDERING
  if (activeSubView) {
    const settingsObj = {
      inApp: formValues[
        `${activeSubView}_in_app` as keyof NotificationFormData
      ] as boolean,
      email: formValues[
        `${activeSubView}_email` as keyof NotificationFormData
      ] as boolean,
    };

    return (
      <NotificationToggle
        title={activeSubView}
        description={descriptions[activeSubView as keyof typeof descriptions]}
        values={settingsObj}
        onToggle={(type: "inApp" | "email") =>
          handleSubToggle(activeSubView, type)
        }
        onBack={() => setActiveSubView(null)}
      />
    );
  }

  // MAIN LIST VIEW
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
            checked={formValues.allow_all}
            onChange={handleAllowAllToggle}
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 transition-colors duration-200 ease-in-out"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5 shadow-sm"></div>
        </label>
      </div>

      {formValues.allow_all && (
        <div className="text-gray-600 font-medium space-y-1">
          <Row
            label="Application status"
            settingsObj={{
              inApp: formValues.application_status_in_app,
              email: formValues.application_status_email,
            }}
            onClick={() => openSubView("application_status")}
          />
          {/* <Row
            label="Internship updates"
            settingsObj={{
              inApp: formValues.internship_updates_in_app,
              email: formValues.internship_updates_email,
            }}
            onClick={() => openSubView("internship_updates")}
          />
          <Row
            label="Recommended internship"
            settingsObj={{
              inApp: formValues.recommended_internship_in_app,
              email: formValues.recommended_internship_email,
            }}
            onClick={() => openSubView("recommended_internship")}
          />
          <Row
            label="Similar internships"
            settingsObj={{
              inApp: formValues.similar_internships_in_app,
              email: formValues.similar_internships_email,
            }}
            onClick={() => openSubView("similar_internships")}
          />
          <Row
            label="Recommended courses"
            settingsObj={{
              inApp: formValues.recommended_courses_in_app,
              email: formValues.recommended_courses_email,
            }}
            onClick={() => openSubView("recommended_courses")}
          /> */}
        </div>
      )}
    </div>
  );
}
