import { useQuery } from "@tanstack/react-query";

// TODO: Replace with actual API call
const getRecentUnits = async (page: number, limit: number) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Dummy data for units
  const allUnits = [
    {
      userId: "unit-1",
      name: "Bevolve",
      description:
        "Leading technology solutions provider specializing in cloud infrastructure and digital transformation services.",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
      bannerUrl: "https://picsum.photos/seed/unit1/400/200",
    },
    {
      userId: "unit-2",
      name: "Yuvabe",
      description:
        "Innovative startup focused on AI-driven analytics and machine learning solutions for enterprise clients.",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
      bannerUrl: "https://picsum.photos/seed/unit2/400/200",
    },
    {
      userId: "unit-3",
      name: "TechCorp",
      description:
        "Global software development company delivering cutting-edge mobile and web applications.",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      bannerUrl: "https://picsum.photos/seed/unit3/400/200",
    },
    {
      userId: "unit-4",
      name: "DataViz Inc",
      description:
        "Data visualization and business intelligence platform helping companies make data-driven decisions.",
      avatarUrl: null,
      bannerUrl: "https://picsum.photos/seed/unit4/400/200",
    },
    {
      userId: "unit-5",
      name: "CloudNine",
      description:
        "Cloud services provider offering scalable infrastructure solutions and DevOps consulting.",
      avatarUrl: "https://i.pravatar.cc/150?img=5",
      bannerUrl: null,
    },
    {
      userId: "unit-6",
      name: "InnovateLabs",
      description:
        "Research and development lab working on next-generation blockchain and Web3 technologies.",
      avatarUrl: "https://i.pravatar.cc/150?img=6",
      bannerUrl: "https://picsum.photos/seed/unit6/400/200",
    },
    {
      userId: "unit-7",
      name: "SecureNet",
      description:
        "Cybersecurity firm providing comprehensive security solutions and penetration testing services.",
      avatarUrl: "https://i.pravatar.cc/150?img=7",
      bannerUrl: "https://picsum.photos/seed/unit7/400/200",
    },
    {
      userId: "unit-8",
      name: "DesignHub",
      description:
        "Creative design agency specializing in UI/UX design, branding, and digital marketing.",
      avatarUrl: "https://i.pravatar.cc/150?img=8",
      bannerUrl: "https://picsum.photos/seed/unit8/400/200",
    },
    {
      userId: "unit-9",
      name: "GreenTech",
      description:
        "Sustainable technology company developing eco-friendly solutions for smart cities and IoT.",
      avatarUrl: null,
      bannerUrl: "https://picsum.photos/seed/unit9/400/200",
    },
    {
      userId: "unit-10",
      name: "FinanceAI",
      description:
        "Fintech startup leveraging artificial intelligence for automated trading and financial planning.",
      avatarUrl: "https://i.pravatar.cc/150?img=10",
      bannerUrl: "https://picsum.photos/seed/unit10/400/200",
    },
    {
      userId: "unit-11",
      name: "HealthTech Pro",
      description:
        "Healthcare technology provider building telemedicine platforms and health monitoring systems.",
      avatarUrl: "https://i.pravatar.cc/150?img=11",
      bannerUrl: "https://picsum.photos/seed/unit11/400/200",
    },
    {
      userId: "unit-12",
      name: "EduLearn",
      description:
        "EdTech company creating interactive learning platforms and online education solutions.",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      bannerUrl: null,
    },
  ];

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = allUnits.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(allUnits.length / limit),
      totalItems: allUnits.length,
      itemsPerPage: limit,
    },
  };
};

export const useRecentUnits = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["recent-units", page, limit],
    queryFn: () => getRecentUnits(page, limit),
  });
};