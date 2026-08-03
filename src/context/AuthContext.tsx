import { createContext, useContext, useEffect, useState } from "react";
import { getSelf } from "../services/customers";
import type { UserBasicParams } from "../types/ServiceTypes/services.types";

type AuthContextType = {
  token: string | null;
  user: UserBasicParams | null;
  authReady: boolean
  login: (newToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserBasicParams | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    async function Authenticate() {
      setAuthReady(false);
      if (token === null || token.trim().length === 0) {
        setUser(null);
        setAuthReady(true);
      }
      else if(token.trim().length > 0) {
        try {
          const self = await getSelf();
          
          if(self.username.length > 0) {
            setUser(self);
          }
          else {
            setUser(null);
            setToken(null);
          }
        }
        catch (err) {
          console.error("Error authenticating...")
          logout();
          setUser(null);
        }
        finally {
          setAuthReady(true);
        }
      }
    }

    Authenticate()

  }, [token])

  return (
    <AuthContext.Provider value={{ token, user, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);