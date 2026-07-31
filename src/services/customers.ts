import type { Customer, CustomerBasicParams } from "../types/ServiceTypes/services.types";
import request from "./request";

async function getCustomers(): Promise<Customer[]> {
  const data = await request<Customer[]>("/customers", { method: "GET" }, "get all customers");

  if (Array.isArray(data)) {
    return data;
  }

  throw new Error("Unexpected response format from customers API");
}

async function getCustomer(customer_id: number): Promise<CustomerBasicParams> {
  return request<CustomerBasicParams>(
    `/customers/${customer_id}`,
    { method: "GET" },
    `get customer" ${customer_id}`,
  );
}

async function editCustomer(customer_id: number, editParams: CustomerBasicParams): Promise<CustomerBasicParams> {
  return request<CustomerBasicParams>(
    `/customers/${customer_id}`,
    {
      method: "PATCH",
      body: JSON.stringify(editParams),
    },
    `edit customer: ${customer_id}`,
  );
}

async function deleteCustomer(customer_id: number): Promise<boolean> {
  await request<void>(
    `/customers/${customer_id}`,
    { method: "DELETE" },
    `delete customer: ${customer_id}`,
  );

  return true;
}

async function addCustomer(newCustomer: CustomerBasicParams): Promise<Customer> {
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
