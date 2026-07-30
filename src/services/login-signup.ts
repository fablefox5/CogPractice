import request from "./request";
import { addCustomer } from "./customers";
import type { CustomerBasicParams, LoginResult } from "../types/ServiceTypes/services.types";

const AUTH_STORAGE_KEY = "northstar_auth_user";

function getStoredAuthUser(): LoginResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as LoginResult;
  } catch {
    return null;
  }
}

function setStoredAuthUser(user: LoginResult | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

async function login(username: string, password: string): Promise<LoginResult> {
  const user = await request<LoginResult>(
    `/login`,
    {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    },
    `login attempt for username: ${username}`,
  );

  setStoredAuthUser(user);
  return user;
}

async function signup(signupData: CustomerBasicParams): Promise<LoginResult> {
  const createdCustomer = await addCustomer(signupData);

  const user: LoginResult = {
    username: createdCustomer.username,
    user_id: createdCustomer.user_id,
    is_admin: createdCustomer.is_admin,
  };

  setStoredAuthUser(user);
  return user;
}

export { login, signup, getStoredAuthUser, setStoredAuthUser };