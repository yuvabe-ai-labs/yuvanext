// import { useState, useEffect } from "react";
// import axiosInstance from "@/config/platform-api";

// export const useHiredApplicants = () => {
//   const [data, setData] = useState<any[]>([]);
//   const [unitInfo, setUnitInfo] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         // 1. Fetch Unit Info
//         const profileRes = await axiosInstance.get("/profile");
//         setUnitInfo({
//           unit_name: profileRes.data.name || "Unit",
//           avatar_url: profileRes.data.avatarUrl,
//         });

//         // 2. Fetch Applications
//         // Based on your log, this endpoint works, so keep using it.
//         const appsRes = await axiosInstance.get("/unit/applications");

//         // FIX 1: Access the nested data array correctly based on your log
//         // Log shows: { data: { data: [Array] } }
//         const allApps = appsRes.data?.data || [];

//         // 3. Filter for HIRED & ACCEPTED
//         const hiredApps = allApps.filter((item: any) => {
//           // FIX 2: Access properties inside the 'application' object
//           const app = item.application;

//           // FIX 3: Check for "accept" (from your log), not "accepted"
//           return (
//             app?.status === "hired" && app?.candidateOfferDecision === "accept"
//           );
//         });

//         // 4. Normalize Data Structure
//         const formatted = hiredApps.map((item: any) => ({
//           application_id: item.application.id,
//           status: item.application.status,
//           offer_decision: item.application.candidateOfferDecision,

//           // Internship object is at the root of the item
//           internship: item.internship || {},

//           // Candidate object is at the root of the item
//           student: {
//             // FIX 4: Backend says 'name', not 'full_name'
//             full_name: item.candidate?.name,
//             // FIX 5: Backend says 'avatarUrl', not 'avatar_url'
//             avatar_url: item.candidate?.avatarUrl || item.candidate?.image,
//             id: item.candidate?.userId,
//             email: item.candidate?.email,
//             phone: item.candidate?.phone,
//           },
//         }));

//         setData(formatted);
//       } catch (err: any) {
//         console.error("Error fetching hired applicants:", err);
//         setError(err.message || "Failed to fetch hired applicants");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return { data, unitInfo, loading, error };
// };

import { useQuery } from "@tanstack/react-query";
import { getHiredApplicants, getUnitProfile } from "@/services/hired.service";

// Hook 1: Get Profile Info (Unit Name/Avatar)
export const useUnitProfile = () => {
  return useQuery({
    queryKey: ["unitProfile"],
    queryFn: getUnitProfile,
    // Optional: Select only specific fields if you want to mimic the old state exactly
    select: (data) => ({
      unit_name: data.name || "Unit",
      avatar_url: data.avatarUrl || data.image,
    }),
  });
};

// Hook 2: Get Hired Applicants List
export const useHiredApplicants = () => {
  return useQuery({
    queryKey: ["hiredApplicants"],
    queryFn: getHiredApplicants,
  });
};
