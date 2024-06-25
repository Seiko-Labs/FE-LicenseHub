import { FetchError, ID } from "@/types";
import { del, get, post, put } from "@/util";
import { access } from "@/service/user";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

interface EditRequest {
  id: ID;
}

export const useResources = <T>(key: string) =>
  useSWR<T[]>(key, () => access((token) => get(token, `${key}/`)));

export const useCreateResource = <RE, RQ>(key: string) =>
  useSWRMutation<RE, FetchError, string, RQ>(key, (_, arg) =>
    access((token) => post<RQ>(token, `${key}/`, arg.arg), arg),
  );

export const useEditResource = <RE, RQ extends EditRequest>(key: string) =>
  useSWRMutation<RE, FetchError, string, RQ>(key, (_, arg) =>
    access((token, ag) => {
      const { id, ...body } = ag.arg;
      return put<Omit<RQ, "id">>(token, `${key}/${id}/`, body);
    }, arg),
  );

export const useRemoveResource = <RE, RQ extends EditRequest>(key: string) =>
  useSWRMutation<RE, FetchError, string, RQ>(key, (_, arg) =>
    access((token, ag) => {
      const { id } = ag.arg;
      return del(token, `${key}/${id}/`);
    }, arg),
  );
