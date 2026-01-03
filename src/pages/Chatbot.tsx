// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
// import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/components/ui/use-toast";
// import { Send, Sparkles } from "lucide-react";
// import chatbotAvatar from "@/assets/chatbot.png";
// import logo from "@/assets/logo-3.png";
// import bag from "@/assets/bag.svg";
// import book from "@/assets/book.svg";
// import paper from "@/assets/paper.svg";
// import mathingIntershipSvg from "@/assets/MathingIntership.svg";
// import aurovilleUnitSvg from "@/assets/AurovilleUnit.svg";
// import SkillCoursesSvg from "@/assets/SkillCourses.svg";
// import ChatBG from "@/assets/chatBG.png";
// import { useIntern } from "@/hooks/useInternships";
// import {
//   useInternshipRecommendations,
//   useCourseRecommendations,
// } from "@/hooks/useRecommendations";
// import { useCourses } from "@/hooks/useCourses";

// interface Message {
//   id: string;
//   content: string;
//   role: "user" | "assistant";
//   timestamp: Date;
// }

// const Chatbot = () => {
//   const { user } = useAuth();
//   const { toast } = useToast();

//   const [userSkills, setUserSkills] = useState<string[]>([]);
//   const { internships, loading: internshipsLoading } = useIntern();
//   const { courses, loading: coursesLoading } = useCourses();

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [showChat, setShowChat] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [userProfile, setUserProfile] = useState<any>(null);
//   const [profileLoading, setProfileLoading] = useState(true);
//   const [profileError, setProfileError] = useState<string | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const messagesContainerRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();
//   const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
//   const [isMultiSelect, setIsMultiSelect] = useState(false);
//   const [accumulatedUnitData, setAccumulatedUnitData] = useState<any>({});
//   const [accumulatedStudentData, setAccumulatedStudentData] = useState<any>({});
//   const [waitingForCustomInput, setWaitingForCustomInput] = useState(false);
//   const [customInputContext, setCustomInputContext] = useState<string>("");
//   const [candidateCount, setCandidateCount] = useState<number | null>(null);
//   const [skillMatches, setSkillMatches] = useState<number | null>(null);

//   const inputRef = useRef<HTMLInputElement | null>(null);

//   // 👇 Auto-focus input whenever messages or quick options update
//   useEffect(() => {
//     if (!isTyping && !isLoading) {
//       inputRef.current?.focus();
//     }
//   }, [messages, isTyping, isLoading]);

//   // 👇 Also scroll to bottom (optional, if not already implemented)
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     const fetchCandidateData = async () => {
//       // Fetch total number of student profiles
//       const { count, error } = await supabase
//         .from("student_profiles")
//         .select("*", { count: "exact", head: true });

//       if (error) {
//         console.error("Error fetching candidate count:", error);
//       } else {
//         setCandidateCount(count);
//       }

//       // Example skill match logic (replace later with real logic)
//       const { data: profiles, error: skillError } = await supabase
//         .from("student_profiles")
//         .select("skills");

//       if (skillError) {
//         console.error("Error fetching skills:", skillError);
//         return;
//       }

//       // Example: Count profiles that have at least one skill
//       const matched = profiles?.filter(
//         (p) => Array.isArray(p.skills) && p.skills.length > 0
//       ).length;

//       setSkillMatches(matched || 0);
//     };

//     fetchCandidateData();
//   }, []);

//   // Fetch user profile data
//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (user) {
//         console.log("Fetching profile for user:", user.id);
//         setProfileLoading(true);
//         setProfileError(null);

//         const { data, error } = await supabase
//           .from("profiles")
//           .select("*")
//           .eq("user_id", user.id)
//           .single();

//         if (error) {
//           console.error("Error fetching profile:", error);
//           setProfileError("Failed to load profile. Please refresh the page.");
//           setProfileLoading(false);
//         } else if (data) {
//           console.log("Profile fetched successfully:", data);
//           setUserProfile(data);
//           setProfileLoading(false);

//           // Check if onboarding is completed
//           if (data?.onboarding_completed) {
//             setIsCompleted(true);
//           }
//         } else {
//           console.error("No profile found for user");
//           setProfileError("Profile not found. Please try signing in again.");
//           setProfileLoading(false);
//         }

//         if (data) {
//           const { data: studentProfile } = await supabase
//             .from("student_profiles")
//             .select("skills")
//             .eq("profile_id", data.id)
//             .maybeSingle();

//           if (studentProfile?.skills) {
//             let skills: any[] = [];

//             if (typeof studentProfile.skills === "string") {
//               try {
//                 // Try to parse JSON
//                 const parsed = JSON.parse(studentProfile.skills);
//                 skills = Array.isArray(parsed)
//                   ? parsed
//                   : studentProfile.skills.split(",").map((s) => s.trim());
//               } catch {
//                 // If invalid JSON, fallback to comma-separated
//                 skills = studentProfile.skills.split(",").map((s) => s.trim());
//               }
//             } else if (Array.isArray(studentProfile.skills)) {
//               skills = studentProfile.skills;
//             }

//             setUserSkills(skills);
//           }
//         }
//       }
//     };

//     fetchUserProfile();
//   }, [user]);

//   // Use recommendation hooks
//   const recommendedInternships = useInternshipRecommendations(
//     internships,
//     userSkills
//   );
//   const recommendedCourses = useCourseRecommendations(courses, userSkills);

//   // count total units matches with student's skill
//   const totalUnits = [];
//   recommendedInternships.map((internship) =>
//     totalUnits.push(internship.created_by)
//   );

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isTyping]);

//   const startChat = async () => {
//     setShowChat(true);
//     setIsTyping(true);

//     setTimeout(() => {
//       // Prefer full_name from userProfile, fallback to user_metadata, then email, then generic greeting
//       const name =
//         userProfile.full_name ||
//         user?.user_metadata?.full_name ||
//         user?.email?.split("@")[0] ||
//         "there";

//       const initialMessage: Message = {
//         id: "1",
//         content: `Hey, ${name}!👋.`,
//         role: "assistant",
//         timestamp: new Date(),
//       };
//       setMessages([initialMessage]);
//       setIsTyping(false);
//     }, 1000);
//   };

//   const stringToArray = (value: string): string[] => {
//     if (value.includes(",")) {
//       return value
//         .split(",")
//         .map((v) => v.trim())
//         .filter((v) => v.length > 0);
//     }
//     return [value.trim()];
//   };

//   // Phone number validation function
//   const validatePhoneNumber = (phone: string): boolean => {
//     // Remove all spaces and special characters
//     const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "");

//     // Check if it's a valid phone number (10 digits or with country code)
//     const phoneRegex = /^(\+?\d{1,3})?[\s-]?\d{10}$/;
//     return phoneRegex.test(cleanedPhone) && cleanedPhone.length >= 10;
//   };

//   const sendMessage = async (messageContent?: string) => {
//     const content = messageContent || inputValue.trim();
//     const userRole = userProfile?.role;

//     if (!content || isLoading || !userRole) return;

//     // If waiting for custom input after "Add Skills" or "Not sure"
//     if (waitingForCustomInput) {
//       const userMessage: Message = {
//         id: Date.now().toString(),
//         content,
//         role: "user",
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, userMessage]);
//       setInputValue("");

//       // Store the custom skills
//       await storeCustomSkills(content, customInputContext);

//       setWaitingForCustomInput(false);
//       setCustomInputContext("");
//       setIsLoading(true);
//       setIsTyping(true);

//       // Continue with the conversation
//       try {
//         const conversationHistory = messages.map((msg) => ({
//           role: msg.role,
//           content: msg.content,
//         }));

//         const { data, error } = await supabase.functions.invoke("gemini-chat", {
//           body: {
//             message: content,
//             conversationHistory,
//             userRole,
//           },
//         });

//         if (error) throw error;

//         if (data?.success && data?.response) {
//           setTimeout(() => {
//             const botMessage: Message = {
//               id: (Date.now() + 1).toString(),
//               content: data.response,
//               role: "assistant",
//               timestamp: new Date(),
//             };
//             setMessages((prev) => [...prev, botMessage]);
//             setIsTyping(false);
//           }, 1500);
//         }
//       } catch (error) {
//         console.error("Chat error:", error);
//         setIsTyping(false);
//         toast({
//           title: "Error",
//           description: "Sorry, I'm having trouble responding right now.",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//       return;
//     }

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       content,
//       role: "user",
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputValue("");
//     setIsLoading(true);
//     setIsTyping(true);

//     // Validate phone number if this is a phone number question
//     const lastBotMessage =
//       messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content ||
//       "";

//     if (
//       lastBotMessage.toLowerCase().includes("phone number") ||
//       lastBotMessage.toLowerCase().includes("phone") ||
//       lastBotMessage.toLowerCase().includes("contact number")
//     ) {
//       if (!validatePhoneNumber(content)) {
//         setTimeout(() => {
//           const errorMessage: Message = {
//             id: (Date.now() + 1).toString(),
//             content:
//               "Please enter a valid phone number with at least 10 digits. Try again:",
//             role: "assistant",
//             timestamp: new Date(),
//           };
//           setMessages((prev) => [...prev, errorMessage]);
//           setIsTyping(false);
//           setIsLoading(false);
//         }, 1000);
//         return;
//       }
//     }

//     // Store user data based on conversation context
//     await storeUserData(content);

//     try {
//       const conversationHistory = messages.map((msg) => ({
//         role: msg.role,
//         content: msg.content,
//       }));

//       console.log("Sending message to chatbot with role:", userRole);
//       const { data, error } = await supabase.functions.invoke("gemini-chat", {
//         body: {
//           message: content,
//           conversationHistory,
//           userRole,
//         },
//       });

//       if (error) {
//         throw error;
//       }

//       if (data?.success && data?.response) {
//         // Check if conversation is complete
//         if (
//           data.response.includes("Perfect! You're all set!") ||
//           data.response.includes("find the best matches") ||
//           data.response.includes("find the best candidates")
//         ) {
//           setTimeout(async () => {
//             // Mark onboarding as completed
//             try {
//               console.log("Updating onboarding completion for user:", user?.id);
//               const { data: updateData, error: updateError } = await supabase
//                 .from("profiles")
//                 .update({ onboarding_completed: true })
//                 .eq("user_id", user?.id)
//                 .select();

//               if (updateError) {
//                 console.error("Error updating onboarding status:", updateError);
//                 toast({
//                   title: "Update Error",
//                   description:
//                     "Failed to update onboarding status: " +
//                     updateError.message,
//                   variant: "destructive",
//                 });
//               } else {
//                 console.log(
//                   "Successfully updated onboarding status:",
//                   updateData
//                 );
//               }
//             } catch (error) {
//               console.error("Error updating onboarding status:", error);
//               toast({
//                 title: "Update Error",
//                 description: "Failed to update onboarding status",
//                 variant: "destructive",
//               });
//             }

//             setIsCompleted(true);
//             setIsTyping(false);
//           }, 1500);
//           return;
//         }

//         setTimeout(() => {
//           const botMessage: Message = {
//             id: (Date.now() + 1).toString(),
//             content: data.response,
//             role: "assistant",
//             timestamp: new Date(),
//           };
//           setMessages((prev) => [...prev, botMessage]);
//           setIsTyping(false);
//         }, 1500);
//       } else {
//         throw new Error(data?.error || "Failed to get response");
//       }
//     } catch (error) {
//       console.error("Chat error:", error);
//       setIsTyping(false);

//       // Handle quota exceeded error
//       if (error.message && error.message.includes("quota")) {
//         toast({
//           title: "Daily Limit Reached",
//           description:
//             "The AI service has reached its daily limit. Please try again tomorrow.",
//           variant: "destructive",
//         });
//       } else {
//         toast({
//           title: "Error",
//           description: "Sorry, I'm having trouble responding right now.",
//           variant: "destructive",
//         });
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const storeCustomSkills = async (customSkills: string, context: string) => {
//     if (!user?.id) return;

//     try {
//       const { data: profileData, error: profileError } = await supabase
//         .from("profiles")
//         .select("id")
//         .eq("user_id", user.id)
//         .single();

//       if (profileError) {
//         console.error("Error fetching profile:", profileError);
//         return;
//       }

//       const profileId = profileData.id;
//       const isUnit = userProfile?.role === "unit";
//       const skillsArray = stringToArray(customSkills);

//       if (isUnit) {
//         const updatedUnitData = {
//           ...accumulatedUnitData,
//           skills_offered: [
//             ...(accumulatedUnitData.skills_offered || []),
//             ...skillsArray,
//           ],
//         };
//         setAccumulatedUnitData(updatedUnitData);

//         const { data, error } = await supabase
//           .from("units")
//           .upsert(
//             { profile_id: profileId, ...updatedUnitData },
//             { onConflict: "profile_id" }
//           )
//           .select();

//         if (error) {
//           console.error("Error updating units with custom skills:", error);
//         } else {
//           console.log("Successfully added custom skills to units:", data);
//         }
//       } else {
//         const updatedStudentData = {
//           ...accumulatedStudentData,
//           skills: [...(accumulatedStudentData.skills || []), ...skillsArray],
//         };
//         setAccumulatedStudentData(updatedStudentData);

//         const { data, error } = await supabase
//           .from("student_profiles")
//           .upsert(
//             { profile_id: profileId, ...updatedStudentData },
//             { onConflict: "profile_id" }
//           )
//           .select();

//         if (error) {
//           console.error(
//             "Error updating student_profiles with custom skills:",
//             error
//           );
//         } else {
//           console.log(
//             "Successfully added custom skills to student_profiles:",
//             data
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Error storing custom skills:", error);
//     }
//   };

//   const storeUserData = async (userResponse: string) => {
//     if (!user?.id) return;

//     const lastBotMessage =
//       messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content ||
//       "";
//     const isUnit = userProfile?.role === "unit";

//     try {
//       let profileUpdateData: any = {};
//       let roleSpecificData: any = {};

//       if (!isUnit) {
//         if (
//           lastBotMessage.toLowerCase().includes("phone number") ||
//           lastBotMessage.toLowerCase().includes("phone") ||
//           lastBotMessage.toLowerCase().includes("number")
//         ) {
//           profileUpdateData.phone = userResponse.trim();
//           console.log("Storing phone number:", userResponse);
//         }

//         if (lastBotMessage.toLowerCase().includes("gender")) {
//           profileUpdateData.gender = userResponse.trim();
//           console.log("Storing gender:", userResponse);
//         }

//         if (lastBotMessage.toLowerCase().includes("profile type")) {
//           const formattedType = userResponse.trim().toLowerCase();

//           if (formattedType === "student") {
//             roleSpecificData.profile_type = "Student";
//           } else if (formattedType === "fresher") {
//             roleSpecificData.profile_type = "Fresher";
//           } else if (formattedType === "working") {
//             roleSpecificData.profile_type = "Working";
//           } else if (formattedType === "graduate") {
//             roleSpecificData.profile_type = "Graduate";
//           } else {
//             console.warn("Invalid profile type entered:", userResponse);
//           }

//           console.log("Storing profile type:", roleSpecificData.profile_type);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("area of interest") ||
//           lastBotMessage.toLowerCase().includes("which area")
//         ) {
//           roleSpecificData.interests = stringToArray(userResponse);
//           console.log(
//             "Storing interests as array:",
//             roleSpecificData.interests
//           );
//         }

//         if (
//           lastBotMessage.includes("Technology & Digital") ||
//           lastBotMessage.includes("Creative & Design") ||
//           lastBotMessage.includes("Marketing & Communication") ||
//           lastBotMessage.includes("Business & Entrepreneurship") ||
//           lastBotMessage.includes("Personal Growth & Soft Skills")
//         ) {
//           roleSpecificData.skills = stringToArray(userResponse);
//           console.log("Storing skills as array:", roleSpecificData.skills);
//         }

//         if (lastBotMessage.toLowerCase().includes("looking for right now")) {
//           roleSpecificData.looking_for = stringToArray(userResponse);
//           console.log("Storing looking_for:", roleSpecificData.looking_for);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("education") ||
//           lastBotMessage.toLowerCase().includes("studying") ||
//           lastBotMessage.toLowerCase().includes("grade")
//         ) {
//           roleSpecificData.experience_level = userResponse.trim();
//           console.log("Storing education level:", userResponse);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("about yourself") ||
//           lastBotMessage.toLowerCase().includes("tell me more") ||
//           lastBotMessage.toLowerCase().includes("describe yourself")
//         ) {
//           roleSpecificData.bio = userResponse.trim();
//           console.log("Storing bio:", userResponse);
//         }
//       } else {
//         if (
//           lastBotMessage.toLowerCase().includes("name of your unit") ||
//           lastBotMessage.toLowerCase().includes("what is your unit called") ||
//           lastBotMessage.toLowerCase().includes("unit name") ||
//           lastBotMessage.toLowerCase().includes("organization name") ||
//           lastBotMessage.toLowerCase().includes("what's the name")
//         ) {
//           roleSpecificData.unit_name = userResponse.trim();
//           console.log("✅ Storing unit name:", userResponse);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("type of unit") ||
//           lastBotMessage.toLowerCase().includes("category") ||
//           lastBotMessage.toLowerCase().includes("what kind of unit") ||
//           lastBotMessage.toLowerCase().includes("unit's type")
//         ) {
//           roleSpecificData.unit_type = userResponse.trim();
//           console.log("✅ Storing unit type:", userResponse);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("describe your unit") ||
//           lastBotMessage.toLowerCase().includes("what does your unit do") ||
//           lastBotMessage.toLowerCase().includes("about your unit")
//         ) {
//           roleSpecificData.description = userResponse.trim();
//           console.log("Storing unit description:", userResponse);
//         }

//         if (
//           lastBotMessage.includes("number") ||
//           lastBotMessage.toLowerCase().includes("number to reach") ||
//           (lastBotMessage.toLowerCase().includes("phone") &&
//             lastBotMessage.toLowerCase().includes("unit")) ||
//           lastBotMessage.toLowerCase().includes("contact number")
//         ) {
//           roleSpecificData.contact_phone = userResponse.trim();
//           console.log("Storing unit phone number:", userResponse);
//         }

//         if (lastBotMessage.includes("email")) {
//           roleSpecificData.contact_email = userResponse.trim();
//           console.log("Storing unit email:", userResponse);
//         }

//         if (lastBotMessage.includes("city")) {
//           roleSpecificData.address = userResponse.trim();
//           console.log("Storing unit location:", userResponse);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("location") ||
//           lastBotMessage.toLowerCase().includes("address") ||
//           lastBotMessage.toLowerCase().includes("where is your unit")
//         ) {
//           roleSpecificData.address = userResponse.trim();
//           console.log("Storing unit address:", userResponse);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("website") ||
//           lastBotMessage.toLowerCase().includes("web address") ||
//           lastBotMessage.toLowerCase().includes("url")
//         ) {
//           roleSpecificData.website_url = userResponse.trim();
//           console.log("Storing website:", userResponse);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("what your unit focuses on") ||
//           lastBotMessage.toLowerCase().includes("focus areas") ||
//           lastBotMessage.toLowerCase().includes("your unit focus on") ||
//           lastBotMessage.toLowerCase().includes("areas of focus")
//         ) {
//           roleSpecificData.focus_areas = stringToArray(userResponse);
//           console.log("Storing unit Focus area", roleSpecificData.focus_areas);
//         }

//         if (
//           lastBotMessage.includes("Technology & IT") ||
//           lastBotMessage.includes("Creative & Design") ||
//           lastBotMessage.includes("Marketing & Communications") ||
//           lastBotMessage.includes("Business & Management") ||
//           lastBotMessage.includes("Research & Innovation") ||
//           lastBotMessage.includes("Community & Social Impact") ||
//           lastBotMessage.includes("Education & Training")
//         ) {
//           roleSpecificData.skills_offered = stringToArray(userResponse);
//           console.log(
//             "Storing skills offered:",
//             roleSpecificData.skills_offered
//           );
//         }

//         if (
//           lastBotMessage
//             .toLowerCase()
//             .includes("opportunities can your unit offer") ||
//           lastBotMessage.includes("opportunities") ||
//           lastBotMessage.toLowerCase().includes("services") ||
//           lastBotMessage.toLowerCase().includes("what do you offer") ||
//           lastBotMessage.toLowerCase().includes("programs")
//         ) {
//           roleSpecificData.opportunities_offered = stringToArray(userResponse);
//           console.log(
//             "Storing opportunities offered:",
//             roleSpecificData.opportunities_offered
//           );
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("mission") ||
//           lastBotMessage.toLowerCase().includes("purpose") ||
//           lastBotMessage.toLowerCase().includes("goal")
//         ) {
//           roleSpecificData.mission = userResponse.trim();
//           console.log("Storing mission:", userResponse);
//         }

//         if (
//           lastBotMessage.toLowerCase().includes("aurovillian unit") ||
//           lastBotMessage.includes("Aurovillian Unit")
//         ) {
//           const response = userResponse.toLowerCase();

//           if (response.includes("non-aurovillian")) {
//             roleSpecificData.is_aurovillian = false;
//           } else if (response.includes("aurovillian")) {
//             roleSpecificData.is_aurovillian = true;
//           } else {
//             roleSpecificData.is_aurovillian = null;
//           }

//           console.log(
//             "Storing Aurovillian status:",
//             roleSpecificData.is_aurovillian
//           );
//         }
//       }

//       if (Object.keys(profileUpdateData).length > 0) {
//         console.log("Updating profiles table with:", profileUpdateData);
//         const { data, error } = await supabase
//           .from("profiles")
//           .update(profileUpdateData)
//           .eq("user_id", user.id)
//           .select();

//         if (error) {
//           console.error("Error updating profiles data:", error);
//         } else {
//           console.log("Successfully updated profiles data:", data);
//         }
//       }

//       if (Object.keys(roleSpecificData).length > 0) {
//         const { data: profileData, error: profileError } = await supabase
//           .from("profiles")
//           .select("id")
//           .eq("user_id", user.id)
//           .single();

//         if (profileError) {
//           console.error("Error fetching profile:", profileError);
//           return;
//         }

//         const profileId = profileData.id;

//         if (!isUnit) {
//           const updatedStudentData = {
//             ...accumulatedStudentData,
//             ...roleSpecificData,
//           };
//           setAccumulatedStudentData(updatedStudentData);

//           console.log(
//             "📝 Updating student_profiles with accumulated data:",
//             updatedStudentData
//           );
//           const { data, error } = await supabase
//             .from("student_profiles")
//             .upsert(
//               { profile_id: profileId, ...updatedStudentData },
//               { onConflict: "profile_id" }
//             )
//             .select();

//           if (error) {
//             console.error("❌ Error updating student_profiles:", error);
//           } else {
//             console.log("✅ Successfully updated student_profiles:", data);
//           }
//         } else {
//           const updatedUnitData = {
//             ...accumulatedUnitData,
//             ...roleSpecificData,
//           };
//           setAccumulatedUnitData(updatedUnitData);

//           console.log("📝 Updating units table with accumulated data:", {
//             profile_id: profileId,
//             ...updatedUnitData,
//           });

//           const { data, error } = await supabase
//             .from("units")
//             .upsert(
//               { profile_id: profileId, ...updatedUnitData },
//               { onConflict: "profile_id" }
//             )
//             .select();

//           if (error) {
//             console.error("❌ Error updating units:", error);
//             console.error("Full error details:", {
//               code: error.code,
//               message: error.message,
//               details: error.details,
//               hint: error.hint,
//             });
//           } else {
//             console.log("✅ Successfully updated units:", data);
//           }
//         }

//         setUserProfile((prev: any) => ({
//           ...prev,
//           ...profileUpdateData,
//           ...roleSpecificData,
//         }));
//       }
//     } catch (error) {
//       console.error("Error storing user data:", error);
//     }
//   };

//   const getQuestionType = (lastBotMessage: string) => {
//     const multiSelectQuestions = [
//       "opportunities can your unit offer",
//       "Technology & IT",
//       "Creative & Design",
//       "Marketing & Communications",
//       "Business & Management",
//       "Research & Innovation",
//       "Community & Social Impact",
//       "Education & Training",
//       "Technology & Digital",
//       "soft skills",
//       "Personal Growth & Soft Skills",
//       "specific skills are you looking for",
//     ];

//     return multiSelectQuestions.some((q) => lastBotMessage.includes(q))
//       ? "multi"
//       : "single";
//   };

//   useEffect(() => {
//     const lastBotMsg = messages[messages.length - 1]?.content || "";
//     const questionType = getQuestionType(lastBotMsg);
//     setIsMultiSelect(questionType === "multi");
//     setSelectedOptions([]);
//   }, [messages]);

//   const handleOptionClick = (option: string) => {
//     // Check if user clicked "Add Skills" or "Not sure / Add Skills"
//     if (option === "Add Skills" || option === "Not sure / Add Skills") {
//       setWaitingForCustomInput(true);

//       // Get the context of what type of skills we're adding
//       const lastBotMsg = messages[messages.length - 1]?.content || "";
//       setCustomInputContext(lastBotMsg);

//       // Add a message asking for custom input
//       const promptMessage: Message = {
//         id: Date.now().toString(),
//         content:
//           "Great! Please type in the skills you'd like to add (separate multiple skills with commas):",
//         role: "assistant",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, promptMessage]);
//       return;
//     }

//     if (isMultiSelect) {
//       setSelectedOptions((prev) => {
//         if (prev.includes(option)) {
//           return prev.filter((o) => o !== option);
//         } else {
//           return [...prev, option];
//         }
//       });
//     } else {
//       sendMessage(option);
//       setSelectedOptions([]);
//     }
//   };

//   const handleSubmitMultiSelect = () => {
//     if (selectedOptions.length > 0) {
//       sendMessage(selectedOptions.join(", "));
//       setSelectedOptions([]);
//     }
//   };

//   const renderQuickOptions = (options: string[]) => {
//     return (
//       <div className="space-y-2 mt-2">
//         <div className="flex flex-wrap gap-2">
//           {options.map((option) => {
//             const isSelected = selectedOptions.includes(option);
//             return (
//               <Button
//                 key={option}
//                 onClick={() => handleOptionClick(option)}
//                 disabled={isLoading}
//                 className={`px-4 py-2 border rounded-full text-sm transition-colors ${
//                   isSelected
//                     ? "border-blue-500 bg-blue-500 text-white"
//                     : "border-blue-500 text-blue-600"
//                 }`}
//                 variant="ghost"
//                 size="sm"
//               >
//                 {option}
//                 {isSelected && isMultiSelect && " ✓"}
//               </Button>
//             );
//           })}
//         </div>

//         {isMultiSelect && selectedOptions.length > 0 && (
//           <div className="flex gap-2 items-center">
//             <Button
//               onClick={handleSubmitMultiSelect}
//               disabled={isLoading}
//               className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
//               size="sm"
//             >
//               Submit ({selectedOptions.length} selected)
//             </Button>
//             <Button
//               onClick={() => setSelectedOptions([])}
//               disabled={isLoading}
//               className="px-4 py-2 border border-gray-300 text-gray-600 rounded-full text-sm"
//               variant="ghost"
//               size="sm"
//             >
//               Clear
//             </Button>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const getQuickOptions = (lastBotMessage: string) => {
//     const isUnit = userProfile?.role === "unit";

//     if (isUnit) {
//       if (lastBotMessage.includes("type of unit")) {
//         return [
//           "Startup",
//           "NGO / Social Enterprise",
//           "Educational Institution",
//           "Corporate / Company",
//           "Government / Public Sector",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("language")) {
//         return ["English", "Tamil", "Hindi", "Telugu", "French"];
//       }
//       if (lastBotMessage.includes("Gender")) {
//         return ["Male", "Female", "Prefer not to say"];
//       }
//       if (
//         lastBotMessage.includes("what your unit focuses on") ||
//         lastBotMessage.includes("unit focuses on") ||
//         lastBotMessage.includes("unit focus on")
//       ) {
//         return [
//           "Technology & IT",
//           "Creative & Design",
//           "Research & Innovation",
//           "Marketing & Communications",
//           "Business & Management",
//           "Community & Social Impact",
//           "Education & Training",
//           "Add Skills",
//         ];
//       }
//       if (
//         lastBotMessage
//           .toLowerCase()
//           .includes("what specific skills are you looking for") ||
//         lastBotMessage.toLowerCase().includes("what specific skills") ||
//         lastBotMessage
//           .toLowerCase()
//           .includes("specific skills are you looking for")
//       ) {
//         return [
//           "Web Development",
//           "Mobile App Development",
//           "Data Analytics",
//           "Cybersecurity",
//           "Cloud Computing",
//           "UI/UX Design",
//           "AI & ML",
//           "Graphic Design",
//           "Video Editing",
//           "Content Writing",
//           "Social Media Management",
//           "Project Management",
//           "Sales",
//           "Financial Literacy",
//           "Research",
//           "Event Management",
//           "Tutoring",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Technology & IT")) {
//         return [
//           "Web Development",
//           "Mobile App Development",
//           "Data Analytics",
//           "Cybersecurity",
//           "Cloud Computing",
//           "UI/UX Design",
//           "AI & ML",
//           "Add Skills",
//         ];
//       }
//       if (
//         lastBotMessage.includes("Creative & Design") ||
//         lastBotMessage.includes("Creative & Design?")
//       ) {
//         return [
//           "Graphic Design",
//           "Video Editing",
//           "Photography",
//           "Animation",
//           "Content Creation",
//           "Illustration",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Marketing & Communications")) {
//         return [
//           "Social Media Management",
//           "SEO",
//           "Content Writing",
//           "Event Management",
//           "PR",
//           "Influencer Marketing",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Business & Management")) {
//         return [
//           "Project Management",
//           "Leadership",
//           "Sales",
//           "Financial Literacy",
//           "HR & Recruitment",
//           "Entrepreneurship",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Research & Innovation")) {
//         return [
//           "Research Writing",
//           "Market Research",
//           "Data Collection",
//           "AR/VR",
//           "Sustainability",
//           "Product Innovation",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Community & Social Impact")) {
//         return [
//           "Volunteering",
//           "Fundraising",
//           "Event Planning",
//           "NGO Management",
//           "Mental Health Support",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Education & Training")) {
//         return [
//           "Tutoring",
//           "Curriculum Development",
//           "Workshop Facilitation",
//           "Career Counseling",
//           "Language Training",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Aurovillian Unit")) {
//         return ["Aurovillian Unit", "Non-Aurovillian Unit"];
//       }
//       if (lastBotMessage.includes("opportunities")) {
//         return [
//           "Internship Opportunities",
//           "Courses",
//           "Volunteering",
//           "Workshops",
//           "Mentorship Programs",
//         ];
//       }
//     } else {
//       if (lastBotMessage.includes("Profile Type")) {
//         return ["Graduate", "Fresher", "Working"];
//       }
//       if (lastBotMessage.includes("Language")) {
//         return ["English", "Tamil", "Hindi", "French"];
//       }
//       if (lastBotMessage.includes("Gender")) {
//         return ["Male", "Female", "Prefer not to say"];
//       }
//       if (lastBotMessage.includes("best number to reach you")) {
//         return []; // free text (user types their phone number)
//       }

//       // 🌟 Step 2 — Education Status
//       if (lastBotMessage.includes("Are you still in school")) {
//         return ["Yes, I'm still in school", "No, I've completed school"];
//       }

//       // 🌟 If YES → school-going students
//       if (lastBotMessage.includes("Which class or grade")) {
//         return ["9th", "10th", "11th", "12th"];
//       }
//       if (
//         lastBotMessage.includes("soft skills") ||
//         lastBotMessage.includes("describe you best")
//       ) {
//         return [
//           "Teamwork",
//           "Creativity",
//           "Communication",
//           "Problem-solving",
//           "Curiosity",
//           "Adaptability",
//           "Add Skills",
//         ];
//       }
//       if (
//         lastBotMessage.includes("interested in learning") ||
//         lastBotMessage.includes("exploring right now")
//       ) {
//         return []; // open-ended input
//       }
//       if (
//         lastBotMessage.includes("How would you like YuvaNext to support you")
//       ) {
//         return [
//           "Help me discover my strengths",
//           "Learn new digital skills",
//           "Find community projects or internships",
//           "Meet mentors or role models",
//         ];
//       }

//       // 🌟 If NO → completed school
//       if (lastBotMessage.includes("area of interest excites you the most")) {
//         return [
//           "Technology & Digital",
//           "Creative & Design",
//           "Marketing & Communication",
//           "Business & Entrepreneurship",
//           "Research & Emerging Fields",
//           "Personal Growth & Soft Skills",
//           "No Ideas I want to explore",
//         ];
//       }

//       // 🌟 Conditional skill follow-ups
//       if (lastBotMessage.includes("Technology & Digital")) {
//         return [
//           "Web Dev",
//           "App Dev",
//           "Programming",
//           "Data Science",
//           "AI/ML",
//           "UI/UX",
//           "Cybersecurity",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Creative & Design")) {
//         return [
//           "Graphic Design",
//           "Video Editing",
//           "Content Creation",
//           "Animation",
//           "Blogging",
//           "Photography",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Marketing & Communication")) {
//         return [
//           "Digital Marketing",
//           "Social Media",
//           "SEO",
//           "Public Speaking",
//           "Event Management",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Business & Entrepreneurship")) {
//         return [
//           "Entrepreneurship",
//           "Sales",
//           "Teamwork",
//           "Financial Literacy",
//           "Project Management",
//           "Add Skills",
//         ];
//       }
//       if (lastBotMessage.includes("Personal Growth & Soft Skills")) {
//         return [
//           "Critical Thinking",
//           "Problem Solving",
//           "Time Management",
//           "Creativity",
//           "Adaptability",
//           "Teamwork",
//           "Add Skills",
//         ];
//       }

//       // 🌟 Shared / final question
//       if (lastBotMessage.includes("looking for right now")) {
//         return ["Courses", "Internships", "Just Exploring"];
//       }

//       // 🌟 Completion messages
//       if (
//         lastBotMessage.includes("Perfect!") ||
//         lastBotMessage.includes("Welcome aboard")
//       ) {
//         return []; // no options, just show message
//       }

//       // Default fallback (no matching phrase)
//       return [];
//     }

//     return null;
//   };

//   if (profileLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-lg font-medium mb-2">
//             Loading your profile...
//           </div>
//           <div className="text-sm text-muted-foreground">
//             Setting up your personalized experience
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (profileError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-lg font-medium mb-2 text-destructive">
//             Profile Error
//           </div>
//           <div className="text-sm text-muted-foreground mb-4">
//             {profileError}
//           </div>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
//           >
//             Refresh Page
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!showChat) {
//     const isUnit = userProfile?.role === "unit";

//     return (
//       <div
//         className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center"
//         style={{ backgroundImage: `url(${ChatBG})` }}
//       >
//         <div className="text-center max-w-md mx-auto space-y-8">
//           <div className="flex justify-center">
//             <a href="/">
//               <img
//                 src={logo}
//                 alt="Company Logo"
//                 className="h-24 w-auto cursor-pointer"
//               />
//             </a>
//           </div>

//           <div className="space-y-4">
//             <h1 className="text-2xl font-bold text-foreground">
//               {isUnit
//                 ? "Welcome to YuvaNext Unit Portal"
//                 : "Welcome to YuvaNext Internships"}
//             </h1>
//             <p className="text-muted-foreground text-sm leading-relaxed">
//               {isUnit
//                 ? "Let's have a quick chat to set up your unit profile! Our AI assistant will help you connect with the best candidates for your opportunities."
//                 : "Let's have a quick chat to personalize your internship journey! Our AI assistant will help you discover opportunities that match your passions."}
//             </p>
//           </div>

//           <div className="relative">
//             <div className="w-32 h-32 mx-auto mb-4 relative">
//               <img
//                 src={chatbotAvatar}
//                 alt="AI Assistant"
//                 className="w-full h-full rounded-full object-cover"
//               />
//             </div>
//             <div className="space-y-2">
//               <h2 className="text-xl font-semibold text-foreground">
//                 {isUnit
//                   ? "Hey there! Let's know your unit better"
//                   : "Hey mate! Let's know you better"}
//               </h2>
//               <p className="text-muted-foreground text-sm">
//                 {isUnit
//                   ? "Help me with all your unit details here"
//                   : "Help me with all your personal details here"}
//               </p>
//             </div>
//           </div>

//           <Button
//             onClick={startChat}
//             size="lg"
//             className="bg-gradient-to-br from-[#07636C] to-[#0694A2] hover:opacity-90 text-white px-8 py-3 rounded-full font-medium transition-opacity"
//           >
//             <Sparkles className="w-4 h-4 mr-2" />
//             Get Started
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   if (isCompleted) {
//     const isUnit = userProfile?.role === "unit";

//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-[#FFF6EF] py-10 px-4">
//         {/* Logo */}
//         <img src={logo} alt="logo" className="w-20 mb-6" />

//         {/* Title */}
//         <h1 className="text-2xl font-bold text-[#333] mb-2">You're All Set!</h1>
//         <p className="text-sm text-gray-500 mb-12">
//           Here's your personalized Yuvanext Dashboard!
//         </p>

//         {/* Cards */}
//         {!isUnit && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Card 1 */}
//             <div className="flex flex-col items-center text-center bg-white shadow-lg border border-[#C94100] rounded-[15px] p-6 w-[266px] h-[287px]">
//               <div className="w-12 h-12 flex items-center justify-center bg-[#FFF4CE] rounded-lg">
//                 <img src={bag} alt="" className="w-full mt-auto" />
//               </div>

//               <h3 className="font-semibold font-primary mt-3">
//                 5 Matching Internships
//               </h3>
//               <p className="text-sm text-gray-500 mb-3">
//                 Found in business domain
//               </p>

//               <img
//                 src={mathingIntershipSvg}
//                 alt=""
//                 className="w-94 mt-[10px]"
//               />
//             </div>

//             {/* Card 2 */}
//             <div className="flex flex-col items-center text-center bg-white shadow-lg border border-[#C94100] rounded-[15px] p-6 w-[266px] h-[287px]">
//               <div className="w-12 h-12 flex items-center justify-center bg-[#FFE8E2] rounded-lg">
//                 <img src={book} alt="" className="w-full mt-auto" />
//               </div>

//               <h3 className="font-semibold mt-3">12 Auroville Units</h3>
//               <p className="text-sm text-gray-500 mb-3">
//                 Relevant to your skills
//               </p>

//               <img src={aurovilleUnitSvg} alt="" className="w-94 mt-3" />
//             </div>

//             {/* Card 3 */}
//             <div className="flex flex-col items-center text-center bg-white shadow-lg border border-[#C94100] rounded-[15px] p-6 w-[266px] h-[287px]">
//               <div className="w-12 h-12 flex items-center justify-center bg-[#FFF4CE] rounded-lg">
//                 <img src={paper} alt="" className="w-full mt-auto" />
//               </div>

//               <h3 className="font-semibold mt-3">3 Skill Courses</h3>
//               <p className="text-sm text-gray-500 mb-3">
//                 To boost your profile
//               </p>

//               <img src={SkillCoursesSvg} alt="" className="w-94 mt-3" />
//             </div>
//           </div>
//         )}

//         {/* Buttons */}
//         <div className="flex gap-3 mt-10 justify-center">
//           {/* Dashboard Button */}
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="
//       flex items-center justify-center
//       px-4 py-2
//       rounded-[18px]
//       text-white font-medium
//       bg-gradient-to-r from-[#C94100] to-[#FFB592]
//       text-sm
//       min-w-[140px]
//     "
//           >
//             Explore my Dashboard
//           </button>

//           {/* Update Button */}
//           {!isUnit && (
//             <button
//               onClick={() => navigate("/profile")}
//               className="
//       flex items-center justify-center
//       px-4 py-2
//       rounded-[18px]
//       border border-[#C94100]
//       text-[#C94100] font-medium
//       text-sm
//       min-w-[120px]
//     "
//             >
//               Update Profile
//             </button>
//           )}
//         </div>
//       </div>
//     );
//   }

//   const lastBotMessage =
//     messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || "";
//   const quickOptions = !waitingForCustomInput
//     ? getQuickOptions(lastBotMessage)
//     : null;

//   return (
//     <div
//       className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-muted flex flex-col items-center justify-center p-6 bg-cover bg-center"
//       style={{ backgroundImage: `url(${ChatBG})` }}
//     >
//       <div className="w-full max-w-2xl mx-auto h-[80vh] flex flex-col">
//         {/* Logo and Welcome */}
//         <div className="text-center mb-6">
//           <div className="flex justify-center">
//             <a href="/">
//               <img
//                 src={logo}
//                 alt="Company Logo"
//                 className="h-24 w-auto cursor-pointer"
//               />
//             </a>
//           </div>
//           <h1 className="text-4xl font-bold text-foreground my-4">
//             Welcome to YuvaNext
//           </h1>
//           <p className="text-muted-foreground text-l">
//             Let's have a quick chat to personalize your internship journey! Our
//             AI assistant will help you discover opportunities that match your
//             passions.
//           </p>
//         </div>

//         {/* Messages - modified to start from bottom */}
//         <div
//           ref={messagesContainerRef}
//           className="flex-1 overflow-y-auto mb-4 px-2 flex flex-col scrollbar-none"
//         >
//           <div className="flex-1"></div>

//           {/* 💬 Chat Messages */}
//           <div className="space-y-4">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${
//                   message.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`flex items-start space-x-3 max-w-[80%] ${
//                     message.role === "user"
//                       ? "flex-row-reverse space-x-reverse"
//                       : ""
//                   }`}
//                 >
//                   {/* 🧠 Chatbot Avatar on left for assistant messages */}
//                   {message.role === "assistant" && (
//                     <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
//                       <img
//                         src={chatbotAvatar}
//                         alt="AI Assistant"
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   )}

//                   {/* 💬 Message Bubble */}
//                   <Card
//                     className={`p-3 rounded-3xl border ${
//                       message.role === "user"
//                         ? "bg-primary text-primary-foreground"
//                         : "bg-transparent border-blue-500 text-blue-600"
//                     }`}
//                   >
//                     <p className="text-sm leading-relaxed whitespace-pre-wrap">
//                       {message.content}
//                     </p>
//                   </Card>
//                 </div>
//               </div>
//             ))}

//             {/* ⚡ Quick Options */}
//             {quickOptions &&
//   messages.length > 0 &&
//   !isTyping &&
//   !isLoading &&
//   messages[messages.length - 1]?.role === "assistant" && (
//     <div className="flex justify-start mt-2 ml-12">
//       <div className="max-w-[80%]">
//         {renderQuickOptions(quickOptions)}
//       </div>
//     </div>
//   )}

//             {/* ⌛ Typing Indicator */}
//             {isTyping && (
//               <div className="flex justify-start items-center space-x-3">
//                 <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
//                   <img
//                     src={chatbotAvatar}
//                     alt="AI Assistant"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="px-4 py-2 border border-blue-500 text-blue-600 rounded-full inline-block">
//                   <div className="flex space-x-1">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
//                     <div
//                       className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
//                       style={{ animationDelay: "0.1s" }}
//                     ></div>
//                     <div
//                       className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
//                       style={{ animationDelay: "0.2s" }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="mt-4">
//           <div className="flex space-x-2">
//             <Input
//               ref={inputRef} // ✅ attach the ref
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               placeholder={
//                 waitingForCustomInput
//                   ? "Type your custom skills here..."
//                   : "Type your answer"
//               }
//               onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//               disabled={isLoading}
//               className="flex-1 rounded-full border border-gray-300"
//             />
//             <Button
//               onClick={() => {
//                 sendMessage();
//                 inputRef.current?.focus(); // ✅ focus again after sending
//               }}
//               disabled={!inputValue.trim() || isLoading}
//               size="sm"
//               className="px-4 rounded-full flex items-center space-x-2"
//             >
//               Send
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;
