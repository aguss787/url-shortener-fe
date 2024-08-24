"use client";

import {
  Context,
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { API, AuthorizationError } from "./api";
import { LoadingOverlay, withLoading } from "../_component/global-loading";

export interface AuthContext {
  user?: User;
  setUser: (user?: User) => void;
}

export interface User {
  token: string;
  email: string;
}

export const AuthContext: Context<AuthContext> = createContext({
  setUser: () => {},
});

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const setUserAndStorage = (user?: User) => {
    setUser(user);
    const token = user?.token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (token && !isLoading && !user) {
        withLoading(setIsLoading, async () => {
          const api = await API.get();
          try {
            const user = await api.getUser(token);
            setUser(user);
          } catch (e) {
            if (e instanceof AuthorizationError) {
              setUserAndStorage(undefined);
            } else {
              throw e;
            }
          }
        });
      }
    })();
  });

  return (
    <AuthContext.Provider value={{ user, setUser: setUserAndStorage }}>
      {isLoading && <LoadingOverlay />}
      {children}
    </AuthContext.Provider>
  );
}
