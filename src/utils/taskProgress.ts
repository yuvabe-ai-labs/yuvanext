import { StudentTask } from "@/types/candidateTasks.types";

export const calculateOverallTaskProgress = (tasks: StudentTask[]): number => {
  if (tasks.length === 0) return 0;

  const completedTasks = tasks.filter((task) => task.status === "accepted");
  const progressPercentage = Math.round(
    (completedTasks.length / tasks.length) * 100
  );

  return progressPercentage;
};

export const getOverallTaskBreakdown = (tasks: StudentTask[]) => {
  const completed = tasks.filter((task) => task.status === "accepted");
  const incomplete = tasks.filter(
    (task) =>
      task.status === "pending" ||
      task.status === "submitted" ||
      task.status === "redo"
  );

  const progressPercentage =
    tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  return {
    total: tasks.length,
    completed: completed.length,
    incomplete: incomplete.length,
    progressPercentage,
  };
};
