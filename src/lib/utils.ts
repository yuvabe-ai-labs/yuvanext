import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export interface BaseApiResponse<T> {
  status_code: number;
  message: string;
  data: T | null;
}

