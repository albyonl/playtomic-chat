import { Auth } from "firebase/auth";
import { Database } from "firebase/database";

export type Result<T> = T;

export interface Playtomic {
  get: <T = unknown>(url: string, cfg?: any) => Promise<T>;
  post: <T = unknown>(url: string, body?: any, cfg?: any) => Promise<T>;
  patch: <T = unknown>(url: string, body?: any, cfg?: any) => Promise<T>;
  logout: () => Promise<void>;
}

export interface Chat {
  ensureSignedIn: () => Promise<void>;
  auth: Auth;
  database: Database;
}
