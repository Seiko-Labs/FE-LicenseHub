import { FetchError, ID } from "@/types";
import { del, get, post, put } from "@/util";
import { access } from "@/service/user";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

interface EditRequest {
  id: ID;
}

export const useResources = <T>(
  key: string | [string, string],
  params?: URLSearchParams,
) => {
  const path = Array.isArray(key) ? key[1] : key;

  return useSWR<T[]>(Array.isArray(key) ? key[0] : key, () =>
    access((token) =>
      get(token, params ? `${path}?${params.toString()}` : path),
    ),
  );
};

export const useCreateResource = <RE, RQ>(key: string | [string, string]) => {
  const path = Array.isArray(key) ? key[1] : key;
  return useSWRMutation<RE, FetchError, string, RQ>(
    Array.isArray(key) ? key[0] : key,
    (_, arg) => access((token) => post<RQ>(token, `${path}/`, arg.arg), arg),
  );
};

export const useEditResource = <RE, RQ extends EditRequest>(
  key: string | [string, string],
) => {
  const path = Array.isArray(key) ? key[1] : key;
  return useSWRMutation<RE, FetchError, string, RQ>(
    Array.isArray(key) ? key[0] : key,
    (_, arg) =>
      access((token, ag) => {
        const { id, ...body } = ag.arg;
        return put<Omit<RQ, "id">>(token, `${path}/${id}/`, body);
      }, arg),
  );
};

export const useRemoveResource = <RE, RQ extends EditRequest>(
  key: string | [string, string],
) => {
  const path = Array.isArray(key) ? key[1] : key;
  return useSWRMutation<RE, FetchError, string, RQ>(
    Array.isArray(key) ? key[0] : key,
    (_, arg) =>
      access((token, ag) => {
        const { id } = ag.arg;
        return del(token, `${path}/${id}/`);
      }, arg),
  );
};
