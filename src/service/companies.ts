import { ID } from "@/types";

export interface Company {
  id: ID;
  name: string;
  partner: number;
}

export interface CreateCompanyRequest {
  name: string;
}

export interface EditCompanyRequest extends CreateCompanyRequest {
  id: ID;
}
