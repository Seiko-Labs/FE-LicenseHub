import { FetchError, FetchRequest, ID } from "@/types";
import { del, get, post, put } from "@/util";
import { access } from "./user";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";

export enum LicenseType {
  ATTENDED = "attended",
  UNATTENDED = "unattended",
}

export interface License {
  id: ID;
  type: LicenseType;
  quantity: number;
  expiration_date: string;
  created_at: string;
  client_package: ID;
}

export interface CreateLicenseRequest {
  type: LicenseType;
  quantity: number;
  expiration_date: string;
  client_package: ID;
}

interface EditLicenseRequest extends CreateLicenseRequest {
  id: ID;
}

interface DeleteLicenseRequest {
  id: ID;
}

const fetchLicenses = async (token: string) => get(token, "licenses/");
const createLicense = async (
  token: string,
  { arg }: FetchRequest<CreateLicenseRequest>,
) => {
  return post<CreateLicenseRequest>(token, "licenses/", arg);
};
export const editLicense = async (
  token: string,
  { arg: { id, ...body } }: FetchRequest<EditLicenseRequest>,
) => put(token, `licenses/${id}/`, body);
export const deleteLicense = async (
  token: string,
  { arg: { id } }: FetchRequest<DeleteLicenseRequest>,
) => del(token, `licenses/${id}/`);
export const useLicenses = () =>
  useSWR<License[]>("licenses", () => access(fetchLicenses));
export const useCreateLicense = () =>
  useSWRMutation<License, FetchError, string, CreateLicenseRequest>(
    "licenses",
    (_, arg) => access(createLicense, arg),
  );
export const useEditLicense = () =>
  useSWRMutation<License, FetchError, string, EditLicenseRequest>(
    "licenses",
    (_, arg) => access(editLicense, arg),
  );
export const useDeleteLicense = () =>
  useSWRMutation<unknown, FetchError, string, DeleteLicenseRequest>(
    "licenses",
    (_, arg) => access(deleteLicense, arg),
  );

interface GenerateKeyRequest {
  package_id: ID;
}

export const generateKey = async (
  token: string,
  { arg }: FetchRequest<GenerateKeyRequest>,
) => {
  return post<GenerateKeyRequest>(token, "generate_key/", arg);
};
export const useGenerateKey = () =>
  useSWRMutation<unknown, FetchError, string, GenerateKeyRequest>(
    "generate",
    (_, arg) => access(generateKey, arg),
  );
