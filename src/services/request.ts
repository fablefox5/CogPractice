const BASE_URL = "http://127.0.0.1:8000/api/v1.0";

export class ApiError extends Error {
  status: number;
  statusText: string;
  detail?: any;

  constructor(status: number, statusText: string, detail?: any) {
    const message = typeof detail === "string" 
      ? detail 
      : detail?.detail || `Request failed with status ${status}: ${statusText}`;

    super(message);

    this.status = status;
    this.statusText = statusText;
    this.detail = detail;

    this.name = "ApiError";
  }
}

export default async function request<T>(
  url: string,
  options: RequestInit = {},
  errDescriptor: string,
): Promise<T> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> | undefined),
      },
      ...options,
    });

    if (!response.ok) {
      let errorDetail: any;

      try {
        errorDetail = await response.json();
      } catch {
        errorDetail = await response.text();
      }

      throw new ApiError(response.status, response.statusText, errorDetail)
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err) {
      console.error(
      `An error has occurred when trying to ${errDescriptor}:`,
      err instanceof ApiError 
        ? `[HTTP ${err.status}] ${err.message}` 
        : err instanceof Error ? err.message : "Unknown error",
      );

    throw err;
  }
}
