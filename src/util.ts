import { Errors } from "./errors";
import { refreshToken } from "./service/user";
import { ErrorResponse } from "./types";

export const url = "http://localhost/api/";

export const href = (path: string) => {
  return new URL(path, url).href;
};

export class FetchError extends Error {
  status?: number;
  info?: ErrorResponse;
}

export const defaultHeaders = {
  "Content-Type": "application/json",
  accept: "application/json",
};

export const f = async (path: string, options?: RequestInit) => {
  const headers = { ...defaultHeaders, ...options?.headers };
  let response = await fetch(href(path), { ...options, headers });

  if (!response.ok) {
    const h = options?.headers ? new Headers(options.headers) : undefined;

    if (h?.has("Authorization") && response.status === 401) {
      const token = await refreshToken();

      const auth = { Authorization: `Bearer ${token.access}` };

      response = await fetch(href(path), {
        ...options,
        headers: { ...headers, ...auth },
      });

      if (response.ok) {
        return response.json();
      }
    }

    const data: ErrorResponse = await response.json();
    const error = new FetchError(Errors[0]);

    error.message = data.detail ?? Errors[response.status] ?? Errors[0];
    error.info = data;
    error.status = response.status;
    throw error;
  }

  return response.json().catch(() => null);
};

export const get = async (t: string, path: string) => {
  const response = await f(path, {
    headers: {
      Authorization: `Bearer ${t}`,
    },
  });

  return response;
};

export const post = async <T>(t: string, path: string, body: T) => {
  const response = await f(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
    },
    body: JSON.stringify(body),
  });

  return response;
};

export const put = async <T>(t: string, path: string, body: T) => {
  const response = await f(path, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${t}`,
    },
    body: JSON.stringify(body),
  });

  return response;
};

export const del = async (t: string, path: string) => {
  const response = await f(path, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${t}`,
    },
  });

  return response;
};
