import { useQuery } from "@tanstack/react-query";
import { getUnits, getUnitById } from "@/services/units.service";

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
