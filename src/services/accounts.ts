import type { Account, AccountBasicParams, Transaction, DepositResponse, WithdrawResponse, TransferResponse } from "../types/ServiceTypes/services.types";
import request from "./request";

//USER OR ADMIN ROUTES

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
    { method: "GET", 
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `get account: ${account_id}`,
  );
}


async function getMyAccounts({signal}: {signal: AbortSignal | undefined}): Promise<Account[]> {
  return request<Account[]>(
    `/accounts/customer/me`,
    { method: "GET", 
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    },
    signal: signal },
     
    `get all my accounts`,
  );
}

async function addAccount(newCustomer: AccountBasicParams): Promise<Account> {
  return request<Account>(
    "/accounts",
    {
      method: "POST",
      body: JSON.stringify(newCustomer),
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    "add account",
  );
}

async function getTransactions(account_id: number): Promise<Transaction[]> {
    return request<Transaction[]>(
    `/accounts/${account_id}/transactions`,
    {
      method: "GET",
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `get transaction history: ${account_id}`,
  );
}

async function deposit(account_id: number, amount: number): Promise<DepositResponse> {
  return request<DepositResponse>(
    `/accounts/${account_id}/deposit`,
    {
      method: "PATCH",
      body: JSON.stringify({"amount": amount}),
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `deposit in account: ${account_id}`,
  );
}

async function withdraw(account_id: number, amount: number): Promise<WithdrawResponse> {
  return request<WithdrawResponse>(
    `/accounts/${account_id}/withdraw`,
    {
      method: "PATCH",
      body: JSON.stringify({"amount": amount}),
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `withdraw in account: ${account_id}`,
  );
}

async function transfer(source_id: number, destination_id: number, amount: number): Promise<TransferResponse> {
  const transferDetails = {
    "source_account_id": source_id,
    "destination_account_id": destination_id,
    "amount": amount
  }

  return request<TransferResponse>(
    '/accounts/transfer',
    {
    method: "PATCH",
    body: JSON.stringify(transferDetails),
    headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": 'application/json'
    }}, 
    `transfer between account ids: ${source_id} to ${destination_id}`
  )
}



//ADMIN ROUTES
async function getCustomerAccounts(user_id: number): Promise<Account[]> {
  return request<Account[]>(
    `/accounts/customer/${user_id}`,
    { method: "GET", 
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
     
    `get all customer accounts: ${user_id}`,
  );
}

async function editAccount(account_id: number, editParams: AccountBasicParams): Promise<AccountBasicParams> {
  return request<AccountBasicParams>(
    `/accounts/${account_id}`,
    {
      method: "PATCH",
      body: JSON.stringify(editParams),
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `edit account: ${account_id}`,
  );
}

async function deleteAccount(account_id: number): Promise<boolean> {
  await request<void>(
    `/accounts/${account_id}`,
    { 
      method: "DELETE",      
      headers: {
      "Authorization": `Bearer ${localStorage.getItem('token')}`,
      "Content-Type": "application/json",
    } },
    `delete account: ${account_id}`,
  );

  return true;
}

export { getAccounts, getAccount, editAccount, deleteAccount, addAccount, getTransactions, deposit, withdraw, getCustomerAccounts, getMyAccounts, transfer };
