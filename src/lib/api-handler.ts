import { AxiosError, AxiosResponse } from "axios";
import { BaseApiResponse } from "@/lib/utils";

//  Handles success/error responses and throws appropriate errors

export const handleApiResponse = <T>(
  response: AxiosResponse<BaseApiResponse<T>>,
  defaultValue: T
): T => {
  // Check for any 2xx success status code
  const statusCode = response.data.status_code ?? response.status;

  if (statusCode >= 200 && statusCode < 300) {
    return response.data.data ?? defaultValue;
  } else {
    throw new Error(response.data.message || "API request failed");
  }
};

//  Extracts error message from Axios errors or generic errors

export const handleApiError = (
  error: unknown,
  defaultMessage: string = "An error occurred"
): never => {
  console.error("API Error:", error);

  if (error instanceof AxiosError) {
    throw new Error(
      error.response?.data?.message ?? error.message ?? defaultMessage
    );
  }

  if (error instanceof Error) {
    throw new Error(error.message);
  }

  throw new Error(defaultMessage);
};
