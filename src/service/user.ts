import { Errors } from "@/errors";
import { Credentials, FetchError, FetchRequest } from "@/types";
import { f } from "@/util";
import useSWRMutation from "swr/mutation";

export interface UseTokenResponse {
  access: string;
  refresh: string;
}

export const getSavedToken = () => {
  const raw = localStorage.getItem("token");

  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as UseTokenResponse;
  } catch {
    return undefined;
  }
};

export const saveToken = (data: UseTokenResponse) => {
  localStorage.setItem("token", JSON.stringify(data));
};

export const destroyToken = () => {
  localStorage.removeItem("token");
};

export const fetchToken = async ({ arg }: FetchRequest<Credentials>) => {
  const response = await f(`token/`, {
    method: "POST",
    body: JSON.stringify(arg),
  });

  if (response) {
    saveToken(response);
  }

  return response;
};

export const refreshToken = async () => {
  const token = getSavedToken();

  if (!token) throw new FetchError(Errors.TokenNotFound);

  const response = await f(`token/refresh/`, {
    method: "POST",
    body: JSON.stringify({ refresh: token.refresh }),
  });

  if (response) {
    saveToken(response);
  }

  return response as UseTokenResponse;
};

export const useToken = () =>
  useSWRMutation<UseTokenResponse, FetchError, string, Credentials>(
    "token",
    (_, arg) => fetchToken(arg),
    {
      optimisticData: getSavedToken(),
    },
  );

export const access = <T, R extends FetchRequest<unknown>>(
  cb: (token: string, arg: R) => T,
  arg?: R,
) => {
  const saved = getSavedToken();

  if (!saved) throw new FetchError(Errors.TokenNotFound);
  return cb(saved.access, arg!);
};
