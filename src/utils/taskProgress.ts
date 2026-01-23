import { Task, TaskStatus } from "@/types/candidateTasks.types";

/**
 * Calculate overall task progress with weighted statuses
 * - PENDING: 0% (not completed)
 * - SUBMITTED: 50% (partially completed)
 * - REDO: 0% (not completed)
 * - ACCEPTED: 100% (fully completed)
 */
export const calculateOverallTaskProgress = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) {
    console.log("No tasks to calculate progress");
    return 0;
  }

  const statusWeights = {
    [TaskStatus.PENDING]: 0,
    [TaskStatus.SUBMITTED]: 0.5,
    [TaskStatus.REDO]: 0,
    [TaskStatus.ACCEPTED]: 1,
  };

  console.log("Status weights:", statusWeights);

  const totalWeight = tasks.reduce((sum, task) => {
    const weight = statusWeights[task.taskStatus] || 0;
    console.log(
      `Task: ${task.taskTitle}, Status: ${task.taskStatus}, Weight: ${weight}`,
    );
    return sum + weight;
  }, 0);

  const progressPercentage = Math.round((totalWeight / tasks.length) * 100);

  console.log(
    `Total weight: ${totalWeight}, Total tasks: ${tasks.length}, Progress: ${progressPercentage}%`,
  );

  return progressPercentage;
};

export const getOverallTaskBreakdown = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) {
    return {
      total: 0,
      completed: 0,
      partiallyCompleted: 0,
      incomplete: 0,
      progressPercentage: 0,
    };
  }

  const completed = tasks.filter(
    (task) => task.taskStatus === TaskStatus.ACCEPTED,
  );

  const partiallyCompleted = tasks.filter(
    (task) => task.taskStatus === TaskStatus.SUBMITTED,
  );

  const incomplete = tasks.filter(
    (task) =>
      task.taskStatus === TaskStatus.PENDING ||
      task.taskStatus === TaskStatus.REDO,
  );

  const progressPercentage = calculateOverallTaskProgress(tasks);

  return {
    total: tasks.length,
    completed: completed.length,
    partiallyCompleted: partiallyCompleted.length,
    incomplete: incomplete.length,
    progressPercentage,
  };
};

export const getTaskStatusCounts = (tasks: Task[]) => {
  if (!tasks || tasks.length === 0) {
    return {
      total: 0,
      pending: 0,
      submitted: 0,
      redo: 0,
      accepted: 0,
    };
  }

  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.taskStatus === TaskStatus.PENDING).length,
    submitted: tasks.filter((t) => t.taskStatus === TaskStatus.SUBMITTED)
      .length,
    redo: tasks.filter((t) => t.taskStatus === TaskStatus.REDO).length,
    accepted: tasks.filter((t) => t.taskStatus === TaskStatus.ACCEPTED).length,
  };
};
