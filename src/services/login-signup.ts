import request from "./request";
import { addCustomer } from "./customers";
import type { CustomerBasicParams, LoginResult } from "../types/ServiceTypes/services.types";

async function login(username: string, password: string): Promise<LoginResult> {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);
  const user = await request<LoginResult>(
    `/login`,
    {
      method: "POST",
      body: body.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    },
    `login attempt for username: ${username}`,
  );

  localStorage.setItem('token', user.access_token)
  return user;
}

async function signup(signupData: CustomerBasicParams): Promise<LoginResult> {
  const createdCustomer = await addCustomer(signupData);


  const user = await login(createdCustomer.username, signupData.password)

  return user;
}

export { login, signup };