import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNotifications,
  getNotifications,
} from "@/services/notification.service";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
};

export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
