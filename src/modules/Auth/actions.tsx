import { useContext, createContext, ReactNode, useState } from "react";
import Auth from "./services";
import IUser, { IBipUser } from "../User/interfaces/IUser";
import { LoginPayloadType } from "./types";
import AuthService from "./services";

type authContextType = {
  user: IUser | null;
  isLoggedIn: boolean;
  login: (loginPayloadType: LoginPayloadType) => void;
  logout: () => void;
  //   registerUser: () => void;
};

const authContextDefaultValues: authContextType = {
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  //   registerUser: () => {},
};

const AuthContext = createContext<authContextType>(authContextDefaultValues);

export function useAuth() {
  return useContext(AuthContext);
}

export async function refreshToken(user: IBipUser) {
  const resp = await AuthService.refreshToken({
    refreshToken: user.refreshToken!,
    AccessTokenID: user.accessTokenId!,
  });
  return resp;
}

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const auth = useProviderAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

const useProviderAuth = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const setLocalUser = (user: IUser) => {
    window.localStorage.setItem("jwt", JSON.stringify(user));
  };

  const setupAuth = (user: IUser) => {
    setLocalUser(user);

    setUser(user);
    setIsLoggedIn(true);
  };

  const login = (payload: LoginPayloadType) =>
    Auth.login(payload).then((res) => {
      setupAuth(res.data);
      setIsLoggedIn(true);
      return res;
    });

  const logout = () => {
    window.localStorage.clear();
    setUser(null);
    setIsLoggedIn(false);
  };

  return {
    user,
    isLoggedIn,
    login,
    logout,
  };
};
