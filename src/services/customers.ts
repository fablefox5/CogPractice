import type { Customer, EditParams } from "../types/ServiceTypes/services.types";

const BASE_URL = "http://127.0.0.1:8000/api/v1.0";

async function request<T>(
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

async function getCustomers(): Promise<Customer[]> {
  const data = await request<Customer[]>("/customers", { method: "GET" }, "get all customers");

  if (Array.isArray(data)) {
    return data;
  }

  throw new Error("Unexpected response format from customers API");
}

async function getCustomer(customer_id: number): Promise<EditParams> {
  return request<EditParams>(
    `/customers/${customer_id}`,
    { method: "GET" },
    `get customer ${customer_id}`,
  );
}

async function editCustomer(customer_id: number, editParams: EditParams): Promise<EditParams> {
  return request<EditParams>(
    `/customers/${customer_id}`,
    {
      method: "PATCH",
      body: JSON.stringify(editParams),
    },
    `edit customer ${customer_id}`,
  );
}

async function deleteCustomer(customer_id: number): Promise<boolean> {
  await request<void>(
    `/customers/${customer_id}`,
    { method: "DELETE" },
    `delete customer ${customer_id}`,
  );

  return true;
}

async function addCustomer(newCustomer: EditParams): Promise<Customer> {
  return request<Customer>(
    "/customers",
    {
      method: "POST",
      body: JSON.stringify(newCustomer),
    },
    "add customer",
  );
}

export { getCustomers, getCustomer, editCustomer, deleteCustomer, addCustomer };
