import axiosInstance from "@/config/platform-api";
import { handleApiError, handleApiResponse } from "@/lib/api-handler";
import type {
  CancelMeetingPayload,
  CancelMeetingResponse,
  CreateMeetingPayload,
  ListMeetingsData,
  ListMeetingsParams,
  Meeting,
  MeetingsPagination,
} from "@/types/meetings.types";

const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
};

export const listMeetings = async (
  params: ListMeetingsParams = {},
): Promise<ListMeetingsData> => {
  try {
    const response = await axiosInstance.get("/meetings", { params });
    const payload = handleApiResponse<unknown>(response, null);

    // Normalize backend variants:
    // 1) data: Meeting[]
    // 2) data: { data: Meeting[], pagination: {...} }
    if (Array.isArray(payload)) {
      return {
        data: payload as Meeting[],
        pagination: {
          ...defaultPagination,
          totalItems: payload.length,
          itemsPerPage: payload.length || defaultPagination.itemsPerPage,
        },
      };
    }

    if (payload && typeof payload === "object") {
      const nested = payload as {
        data?: unknown;
        pagination?: Partial<MeetingsPagination>;
      };

      if (Array.isArray(nested.data)) {
        return {
          data: nested.data as Meeting[],
          pagination: {
            ...defaultPagination,
            ...nested.pagination,
          },
        };
      }
    }

    return {
      data: [],
      pagination: defaultPagination,
    };
  } catch (error) {
    return handleApiError(error, "Failed to fetch meetings");
  }
};

export const createMeeting = async (
  payload: CreateMeetingPayload,
): Promise<Meeting> => {
  try {
    const response = await axiosInstance.post("/meetings", payload);
    return handleApiResponse<Meeting>(response, {} as Meeting);
  } catch (error) {
    return handleApiError(error, "Failed to create meeting");
  }
};

export const cancelMeeting = async (
  payload: CancelMeetingPayload,
): Promise<CancelMeetingResponse> => {
  try {
    const response = await axiosInstance.put("/meetings/cancel", payload);
    return handleApiResponse<CancelMeetingResponse>(
      response,
      {} as CancelMeetingResponse,
    );
  } catch (error) {
    return handleApiError(error, "Failed to cancel meeting");
  }
};
