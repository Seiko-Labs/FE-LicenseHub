export interface Credentials {
  username: string;
  password: string;
}

export interface ErrorResponse {
  detail?: string;
}

export class FetchError extends Error {
  status?: number;
  info?: ErrorResponse;
}

export interface FetchRequest<T> {
  arg: T;
}

export type ID = number;
