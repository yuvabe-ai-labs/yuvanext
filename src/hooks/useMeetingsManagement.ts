import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  cancelMeeting,
  createMeeting,
  listMeetings,
} from "@/services/meetings.service";
import type {
  CancelMeetingPayload,
  CreateMeetingPayload,
  ListMeetingsParams,
} from "@/types/meetings.types";

export const useMeetings = (params: ListMeetingsParams) => {
  return useQuery({
    queryKey: ["meetings", params],
    queryFn: () => listMeetings(params),
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateMeetingPayload) => createMeeting(payload),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meeting scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule meeting",
        variant: "destructive",
      });
    },
  });
};

export const useCancelMeeting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CancelMeetingPayload) => cancelMeeting(payload),
    onSuccess: () => {
      toast({
        title: "Meeting Cancelled",
        description: "Meeting was cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel meeting",
        variant: "destructive",
      });
    },
  });
};

