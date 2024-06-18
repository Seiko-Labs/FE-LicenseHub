import { FetchError, FetchRequest, ID } from "@/types";
import { del, get, post, put } from "@/util";
import useSWR from "swr";
import { access } from "./user";
import useSWRMutation from "swr/mutation";

export interface Company {
  id: ID;
  name: string;
  partner: number;
}

export interface CreateCompanyRequest {
  name: string;
}

interface DeleteCompanyRequest {
  id: ID;
}

export interface EditCompanyRequest extends CreateCompanyRequest {
  id: ID;
}

export const fetchCompanies = async (token: string) =>
  get(token, "clientcompanies/");
export const createCompany = async (
  token: string,
  { arg }: FetchRequest<CreateCompanyRequest>,
) => post<CreateCompanyRequest>(token, "clientcompanies/", arg);
export const editCompany = async (
  token: string,
  { arg: { id, ...body } }: FetchRequest<EditCompanyRequest>,
) => put(token, `clientcompanies/${id}/`, body);
export const deleteCompany = async (
  token: string,
  { arg: { id } }: FetchRequest<DeleteCompanyRequest>,
) => del(token, `clientcompanies/${id}/`);
export const useCompanies = () =>
  useSWR<Company[]>("companies", () => access(fetchCompanies));
export const useCreateCompany = () =>
  useSWRMutation<Company, FetchError, string, CreateCompanyRequest>(
    "companies",
    (_, arg) => access(createCompany, arg),
  );
export const useEditCompany = () =>
  useSWRMutation<Company, FetchError, string, EditCompanyRequest>(
    "companies",
    (_, arg) => access(editCompany, arg),
  );
export const useDeleteCompany = () =>
  useSWRMutation<unknown, FetchError, string, DeleteCompanyRequest>(
    "companies",
    (_, arg) => access(deleteCompany, arg),
  );
