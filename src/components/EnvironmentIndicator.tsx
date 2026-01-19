import { env } from "@/env";

const EnvironmentIndicator = () => {
  const isLocalhost = window.location.hostname === "localhost";

  if (env.VITE_STAGE_TYPE === "production" || isLocalhost) {
    return null;
  }

  const isStaging = env.VITE_STAGE_TYPE === "staging";

  return (
    <div className="fixed bottom-0 left-0 w-32 h-32 overflow-hidden z-[9999] pointer-events-none select-none">
      <div
        className={`absolute bottom-7 -left-14 w-[150%] py-1.5
          text-center text-[10px] font-black uppercase tracking-[0.2em]
          rotate-45 shadow-lg border-y
          ${
            isStaging
              ? "bg-amber-400 text-amber-950 border-amber-500"
              : "bg-blue-600 text-white border-blue-700"
          }`}
      >
        {env.VITE_STAGE_TYPE}
      </div>
    </div>
  );
};

export default EnvironmentIndicator;
