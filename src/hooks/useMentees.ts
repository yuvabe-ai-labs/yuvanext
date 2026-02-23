import { useQuery } from "@tanstack/react-query";

// TODO: Replace with actual API call
const getRecentMentees = async (page: number, limit: number) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Dummy data for mentees
  const allMentees = [
    {
      applicationId: "app-1",
      candidateId: "cand-1",
      name: "Arjun Kumar",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      internshipName: "Frontend Developer Intern",
      applicationStatus: "applied",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["React", "TypeScript", "Tailwind"],
      interests: ["UI Design", "Open Source"],
      AppliedAt: "Bevolve",
    },
    {
      applicationId: "app-2",
      candidateId: "cand-2",
      name: "Sneha Patel",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      internshipName: "Backend Developer Intern",
      applicationStatus: "interview",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["Node.js", "MongoDB", "FastAPI", "Docker"],
      interests: ["System Design"],
      AppliedAt: "Yuvabe",
    },
    {
      applicationId: "app-3",
      candidateId: "cand-3",
      name: "Rahul Sharma",
      avatarUrl: null,
      internshipName: "Data Science Intern",
      applicationStatus: "hired",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["Python", "Pandas", "Scikit-learn"],
      interests: ["AI", "Data Visualization"],
      AppliedAt: "Yuvabe",
    },
    {
      applicationId: "app-4",
      candidateId: "cand-4",
      name: "Meera Iyer",
      avatarUrl: "https://i.pravatar.cc/150?img=32",
      internshipName: "UI/UX Intern",
      applicationStatus: "rejected",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: [],
      interests: ["Figma", "Design Systems", "Accessibility"],
      AppliedAt: "Bevolve",
    },
    {
      applicationId: "app-1",
      candidateId: "cand-1",
      name: "Arjun Kumar",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      internshipName: "Graduate Trainee",
      applicationStatus: "hired",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["React", "TypeScript", "Tailwind"],
      interests: ["UI Design", "Open Source"],
      AppliedAt: "Bevolve",
    },
    {
      applicationId: "app-1",
      candidateId: "cand-1",
      name: "Arjun Kumar",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      internshipName: "Frontend Developer Intern",
      applicationStatus: "applied",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["React", "TypeScript", "Tailwind"],
      interests: ["UI Design", "Open Source"],
      AppliedAt: "Bevolve",
    },
    {
      applicationId: "app-2",
      candidateId: "cand-2",
      name: "Sneha Patel",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      internshipName: "Backend Developer Intern",
      applicationStatus: "interview",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["Node.js", "MongoDB", "FastAPI", "Docker"],
      interests: ["System Design"],
      AppliedAt: "Yuvabe",
    },
    {
      applicationId: "app-3",
      candidateId: "cand-3",
      name: "Rahul Sharma",
      avatarUrl: null,
      internshipName: "Data Science Intern",
      applicationStatus: "hired",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["Python", "Pandas", "Scikit-learn"],
      interests: ["AI", "Data Visualization"],
      AppliedAt: "Yuvabe",
    },
    {
      applicationId: "app-4",
      candidateId: "cand-4",
      name: "Meera Iyer",
      avatarUrl: "https://i.pravatar.cc/150?img=32",
      internshipName: "UI/UX Intern",
      applicationStatus: "rejected",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: [],
      interests: ["Figma", "Design Systems", "Accessibility"],
      AppliedAt: "Bevolve",
    },
    {
      applicationId: "app-1",
      candidateId: "cand-1",
      name: "Arjun Kumar",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      internshipName: "Graduate Trainee",
      applicationStatus: "hired",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["React", "TypeScript", "Tailwind"],
      interests: ["UI Design", "Open Source"],
      AppliedAt: "Bevolve",
    },
    {
      applicationId: "app-1",
      candidateId: "cand-1",
      name: "Arjun Kumar",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      internshipName: "Frontend Developer Intern",
      applicationStatus: "applied",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["React", "TypeScript", "Tailwind"],
      interests: ["UI Design", "Open Source"],
      AppliedAt: "Bevolve",
    },
    {
      applicationId: "app-2",
      candidateId: "cand-2",
      name: "Sneha Patel",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      internshipName: "Backend Developer Intern",
      applicationStatus: "interview",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["Node.js", "MongoDB", "FastAPI", "Docker"],
      interests: ["System Design"],
      AppliedAt: "Yuvabe",
    },
    {
      applicationId: "app-3",
      candidateId: "cand-3",
      name: "Rahul Sharma",
      avatarUrl: null,
      internshipName: "Data Science Intern",
      applicationStatus: "hired",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["Python", "Pandas", "Scikit-learn"],
      interests: ["AI", "Data Visualization"],
      AppliedAt: "Yuvabe",
    },
    {
      applicationId: "app-4",
      candidateId: "cand-4",
      name: "Meera Iyer",
      avatarUrl: "https://i.pravatar.cc/150?img=32",
      internshipName: "UI/UX Intern",
      applicationStatus: "rejected",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: [],
      interests: ["Figma", "Design Systems", "Accessibility"],
      AppliedAt: "Bevolve",
    },
    {
      applicationId: "app-1",
      candidateId: "cand-1",
      name: "Abi",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      internshipName: "Graduate Trainee",
      applicationStatus: "hired",
      profileSummary:
        "Frontend developer passionate about React, UI/UX, and building scalable web apps.",
      skills: ["React", "TypeScript", "Tailwind"],
      interests: ["UI Design", "Open Source"],
      AppliedAt: "Bevolve",
    },
  ];

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = allMentees.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(allMentees.length / limit),
      totalItems: allMentees.length,
      itemsPerPage: limit,
    },
  };
};

export const useRecentMentees = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["recent-mentees", page, limit],
    queryFn: () => getRecentMentees(page, limit),
  });
};

// Additional hooks for different mentee statuses (to be implemented when API is ready)
export const useActiveMentees = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["active-mentees", page, limit],
    queryFn: () => getRecentMentees(page, limit), // TODO: Replace with actual API
  });
};

export const useCompletedMentees = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["completed-mentees", page, limit],
    queryFn: () => getRecentMentees(page, limit), // TODO: Replace with actual API
  });
};

export const useOnboardingMentees = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["onboarding-mentees", page, limit],
    queryFn: () => getRecentMentees(page, limit), // TODO: Replace with actual API
  });
};