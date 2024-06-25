import { TokenContext } from "@/components/token-context";
import { useContext } from "react";

export const useToken = () => {
  const context = useContext(TokenContext);

  if (context === undefined) throw Error("No TokenContextProvider");

  return context;
};
