import { FetchError, FetchRequest, ID } from "@/types";
import { del, get, post, put } from "@/util";
import { access } from "./user";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";

export interface Package {
  id: ID;
  hash_code: string;
  hardware_id: string;
  created_at: string;
  expiration_date: string;
  flag: boolean;
  client: ID;
  licenses: number[];
}

export interface CreatePackageRequest {
  hardware_id: string;
  expiration_date: string;
  flag: boolean;
  client: ID;
}

interface EditPackageRequest extends CreatePackageRequest {
  id: ID;
}

interface DeletePackageRequest {
  id: ID;
}

const fetchPackages = async (token: string) => get(token, "clientpackages/");
const createPackage = async (
  token: string,
  { arg }: FetchRequest<CreatePackageRequest>,
) => {
  return post<CreatePackageRequest>(token, "clientpackages/", arg);
};
export const editPackage = async (
  token: string,
  { arg: { id, ...body } }: FetchRequest<EditPackageRequest>,
) => put(token, `clientpackages/${id}/`, body);
export const deletePackage = async (
  token: string,
  { arg: { id } }: FetchRequest<DeletePackageRequest>,
) => del(token, `clientpackages/${id}/`);
export const usePackages = () =>
  useSWR<Package[]>("packages", () => access(fetchPackages));
export const useCreatePackage = () =>
  useSWRMutation<Package, FetchError, string, CreatePackageRequest>(
    "packages",
    (_, arg) => access(createPackage, arg),
  );
export const useEditPackage = () =>
  useSWRMutation<Package, FetchError, string, EditPackageRequest>(
    "packages",
    (_, arg) => access(editPackage, arg),
  );
export const useDeletePackage = () =>
  useSWRMutation<unknown, FetchError, string, DeletePackageRequest>(
    "packages",
    (_, arg) => access(deletePackage, arg),
  );
