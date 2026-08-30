import axios from "axios";
import type { ApiError } from "@/types/api";

/**
 * V1 error shape:
 * {
 *   success: false,
 *   error: "Human-readable message",
 *   code: "VALIDATION_ERROR",
 *   details?: [{ field: "email", message: "Invalid email" }]
 * }
 */
export const getAxiosErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as ApiError | undefined;

    // V1: Primary error field
    if (response?.error && typeof response.error === "string") {
      return response.error;
    }

    // V1: Validation details — return first field error
    if (
      response?.details &&
      Array.isArray(response.details) &&
      response.details.length > 0
    ) {
      return response.details[0].message;
    }

    // V1: Machine-readable code as last resort
    if (response?.code && typeof response.code === "string") {
      return response.code.replace(/_/g, " ").toLowerCase();
    }

    // Legacy fallbacks (old error shapes during migration)
    const legacyData = error.response?.data as
      | Record<string, unknown>
      | undefined;

    if (legacyData?.errors) {
      const errs = legacyData.errors;
      if (typeof errs === "object" && !Array.isArray(errs)) {
        const firstKey = Object.keys(errs as Record<string, unknown>)[0];
        if (
          firstKey &&
          typeof (errs as Record<string, unknown>)[firstKey] === "string"
        ) {
          return (errs as Record<string, string>)[firstKey];
        }
      }
      if (typeof (errs as Record<string, unknown>)?.message === "string") {
        return (errs as Record<string, string>).message;
      }
      if (Array.isArray(errs) && errs.length > 0) {
        return (errs as Array<{ message: string }>)[0].message;
      }
    }

    if (typeof legacyData?.message === "string") {
      return legacyData.message;
    }

    if (error.request) {
      return "Network error. Please check your connection.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

/**
 * V1: Extract validation errors for form field mapping.
 * Returns a record of { fieldName: errorMessage }.
 */
export const getValidationErrors = (error: unknown): Record<string, string> => {
  if (!axios.isAxiosError(error)) return {};

  const response = error.response?.data as ApiError | undefined;
  if (response?.code !== "VALIDATION_ERROR" || !response?.details) return {};

  const errors: Record<string, string> = {};
  for (const detail of response.details) {
    errors[detail.field] = detail.message;
  }
  return errors;
};
