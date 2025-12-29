import type { CreateSaveInput, Save, Tag, TrpcResponse } from "./types";

const API_BASE = import.meta.env.VITE_BACKPOCKET_API_BASE || "https://backpocket.dev";

/**
 * Custom error class for API errors with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public httpStatus?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Parse tRPC response and throw on error
 */
function handleTrpcResponse<TOutput>(data: TrpcResponse<TOutput>): TOutput {
  if (data.error) {
    const errorCode = data.error.data?.code;
    const httpStatus = data.error.data?.httpStatus;

    switch (errorCode) {
      case "UNAUTHORIZED":
        throw new ApiError("Please sign in again", errorCode, httpStatus);
      case "BAD_REQUEST":
        throw new ApiError(data.error.message || "Invalid input", errorCode, httpStatus);
      case "NOT_FOUND":
        throw new ApiError(data.error.message || "Resource not found", errorCode, httpStatus);
      default:
        throw new ApiError(data.error.message || "Something went wrong", errorCode, httpStatus);
    }
  }

  if (!data.result?.data) {
    throw new ApiError("Unexpected response format");
  }

  return data.result.data;
}

/**
 * tRPC query (GET request)
 */
async function trpcQuery<TInput, TOutput>(
  endpoint: string,
  input: TInput,
  token: string
): Promise<TOutput> {
  const inputParam = encodeURIComponent(JSON.stringify(input));
  const url = `${API_BASE}/api/trpc/${endpoint}?input=${inputParam}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data: TrpcResponse<TOutput> = await res.json();
  return handleTrpcResponse(data);
}

/**
 * tRPC mutation (POST request)
 */
async function trpcMutation<TInput, TOutput>(
  endpoint: string,
  input: TInput,
  token: string
): Promise<TOutput> {
  const res = await fetch(`${API_BASE}/api/trpc/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const data: TrpcResponse<TOutput> = await res.json();
  return handleTrpcResponse(data);
}

/**
 * Create a new save (bookmark) in the user's space
 */
export async function createSave(input: CreateSaveInput, token: string): Promise<Save> {
  return trpcMutation<CreateSaveInput, Save>("space.createSave", input, token);
}

/**
 * List all tags for the authenticated user
 */
export async function listTags(token: string): Promise<Tag[]> {
  return trpcQuery<Record<string, never>, Tag[]>("space.listTags", {}, token);
}
