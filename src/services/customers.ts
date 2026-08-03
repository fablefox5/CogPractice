import type { Customer, CustomerBasicParams, UserBasicParams } from "../types/ServiceTypes/services.types";
import request from "./request";


async function getSelf(): Promise<UserBasicParams> {
  return request<UserBasicParams>(
    `/me`,
    { 
      method: "GET",
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `get self`,
  );

}

async function getCustomers(): Promise<Customer[]> {
  const data = await request<Customer[]>("/customers", 
    { 
      method: "GET",
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } }, "get all customers");

  if (Array.isArray(data)) {
    return data;
  }

  throw new Error("Unexpected response format from customers API");
}

async function getCustomer(customer_id: number): Promise<CustomerBasicParams> {
  return request<CustomerBasicParams>(
    `/customers/${customer_id}`,
    { 
      method: "GET",
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `get customer" ${customer_id}`,
  );
}

async function editCustomer(customer_id: number, editParams: CustomerBasicParams): Promise<CustomerBasicParams> {
  return request<CustomerBasicParams>(
    `/customers/${customer_id}`,
    {
      method: "PATCH",
      body: JSON.stringify(editParams),
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `edit customer: ${customer_id}`,
  );
}

async function deleteCustomer(customer_id: number): Promise<boolean> {
  await request<void>(
    `/customers/${customer_id}`,
    { method: "DELETE",      
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
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
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    "add customer",
  );
}

export { getCustomers, getCustomer, editCustomer, deleteCustomer, addCustomer, getSelf };
