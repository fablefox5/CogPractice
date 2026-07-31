import type { Account, AccountBasicParams, Transaction, DepositResponse, WithdrawResponse } from "../types/ServiceTypes/services.types";
import request from "./request";

async function getAccounts(): Promise<Account[]> {
  const data = await request<Account[]>("/accounts", { method: "GET" }, "get all customers");

  if (Array.isArray(data)) {
    return data;
  }

  throw new Error("Unexpected response format from customers API");
}

async function getAccount(account_id: number): Promise<AccountBasicParams> {
  return request<AccountBasicParams>(
    `/accounts/${account_id}`,
    { method: "GET" },
    `get account: ${account_id}`,
  );
}

async function getCustomerAccounts(user_id: number): Promise<Account[]> {
  return request<Account[]>(
    `/accounts/customer/${user_id}`,
    { method: "GET" },
    `get all customer accounts: ${user_id}`,
  );
}

async function editAccount(account_id: number, editParams: AccountBasicParams): Promise<AccountBasicParams> {
  return request<AccountBasicParams>(
    `/accounts/${account_id}`,
    {
      method: "PATCH",
      body: JSON.stringify(editParams),
    },
    `edit account: ${account_id}`,
  );
}

async function deleteAccount(account_id: number): Promise<boolean> {
  await request<void>(
    `/accounts/${account_id}`,
    { method: "DELETE" },
    `delete account: ${account_id}`,
  );

  return true;
}

async function addAccount(newCustomer: AccountBasicParams): Promise<Account> {
  return request<Account>(
    "/accounts",
    {
      method: "POST",
      body: JSON.stringify(newCustomer),
    },
    "add account",
  );
}

async function getTransactions(account_id: number): Promise<Transaction[]> {
    return request<Transaction[]>(
    `/accounts/${account_id}/transactions`,
    {
      method: "GET",
    },
    `get transaction history: ${account_id}`,
  );
}

async function deposit(account_id: number, amount: number): Promise<DepositResponse> {
  return request<DepositResponse>(
    `/accounts/${account_id}/deposit`,
    {
      method: "PATCH",
      body: JSON.stringify({"amount": amount}),
    },
    `deposit in account: ${account_id}`,
  );
}

async function withdraw(account_id: number, amount: number): Promise<WithdrawResponse> {
  return request<WithdrawResponse>(
    `/accounts/${account_id}/withdraw`,
    {
      method: "PATCH",
      body: JSON.stringify({"amount": amount}),
    },
    `withdraw in account: ${account_id}`,
  );
}

export { getAccounts, getAccount, editAccount, deleteAccount, addAccount, getTransactions, deposit, withdraw, getCustomerAccounts };
