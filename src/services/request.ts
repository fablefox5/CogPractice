const BASE_URL = "http://127.0.0.1:8000/api/v1.0";

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
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText || response.statusText}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error(
      `An error has occurred when trying to ${errDescriptor}:`,
      err instanceof Error ? err.message : "Unknown error",
    );
    throw err;
  }
}
