import { useQuery } from "@tanstack/react-query";
import {
  getUnits,
  getUnitById,
  getPublicUnitById,
} from "@/services/units.service";

export const useUnit = () => {
  return useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });
};

export const useUnitById = (id: string) => {
  return useQuery({
    queryKey: ["unit", id],
    queryFn: () => getUnitById(id),
    enabled: !!id,
  });
};

export const usePublicUnitById = (id: string) => {
  return useQuery({
    queryKey: ["publicUnit", id],
    queryFn: () => getPublicUnitById(id),
    enabled: !!id,
  });
};
