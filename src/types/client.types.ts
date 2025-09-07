import { AxiosRequestConfig } from "axios";
import { Auth } from "firebase/auth";
import { Database } from "firebase/database";

export type Result<T> = T;

export interface PlaytomicClientOpts {
  baseURL?: string;
  email: string;
  password: string;
}

export interface PlaytomicHttpClient {
  get: <T = unknown>(url: string, cfg?: AxiosRequestConfig) => Promise<T>;
  post: <T = unknown>(
    url: string,
    body?: any,
    cfg?: AxiosRequestConfig
  ) => Promise<T>;
  patch: <T = unknown>(
    url: string,
    body?: any,
    cfg?: AxiosRequestConfig
  ) => Promise<T>;
  logout: () => Promise<void>;
}

export interface PlaytomicChatClient {
  ensureSignedIn: () => Promise<void>;
  auth: Auth;
  database: Database;
}

export type Playtomic = PlaytomicHttpClient & PlaytomicChatClient;
