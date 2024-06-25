import {
  UseTokenResponse,
  destroyToken,
  getSavedToken,
  saveToken,
} from "@/service/user";
import { FC, PropsWithChildren, createContext, useState } from "react";

export interface TokenContextProps {
  token: UseTokenResponse | null;
  setToken: (token: UseTokenResponse | null) => void;
}

export const TokenContext = createContext<TokenContextProps | null>(null);

export const TokenProvider: FC<PropsWithChildren> = ({ children }) => {
  const [token, _setToken] = useState<UseTokenResponse | null>(
    getSavedToken() ?? null,
  );

  const setToken = (t: UseTokenResponse | null) => {
    if (!t) {
      _setToken(null);
      return destroyToken();
    }

    saveToken(t);

    _setToken(t);
  };

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};
