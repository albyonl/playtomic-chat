import axios from "axios";

import { TokenStore } from "@/lib/token-store";
import type { Playtomic } from "@/types/clients.types";

import { suffixZ } from "@/utils/iso";

export function playtomic(opts: {
  baseURL?: string;
  email: string;
  password: string;
}): Playtomic {

  if(!opts.email || !opts.password) throw new Error("missing params");

  const baseURL = opts.baseURL ?? "https://api.playtomic.io";
  const headers = {};

  const tokenStore = new TokenStore({ directoryName: ".playtomic" });
  let currentTokens: any | null = null;
  const inflight: Record<string, Promise<any> | null> = {};

  const raw = axios.create({ baseURL, headers });
  const auth = axios.create({ baseURL, headers });

  const singleFlight = <T>(k: string, fn: () => Promise<T>) => {
    if (!inflight[k]) inflight[k] = fn().finally(() => (inflight[k] = null));
    return inflight[k] as Promise<T>;
  };

  const isExpired = (isoWithoutZ: string) =>
    Date.now() + 30_000 >=
    new Date(isoWithoutZ + suffixZ(isoWithoutZ)).getTime();

  const login = async () =>
    (
      await raw.post("/v3/auth/login", {
        email: opts.email,
        password: opts.password,
      })
    ).data;

  const refresh = async (rt: string) =>
    (await raw.post("/v3/auth/token", { refresh_token: rt })).data;

  const ensureAccessToken = async (): Promise<string | null> => {
    if (currentTokens && !isExpired(currentTokens.access_token_expiration))
      return currentTokens.access_token;
    if (!currentTokens)
      currentTokens = tokenStore.get("auth", opts.email) ?? null;

    if (currentTokens && isExpired(currentTokens.access_token_expiration)) {
      if (!isExpired(currentTokens.refresh_token_expiration)) {
        try {
          currentTokens = await singleFlight("refresh", () =>
            refresh(currentTokens!.refresh_token)
          );
          tokenStore.set("auth", opts.email, currentTokens);
        } catch {
          currentTokens = null;
        }
      } else currentTokens = null;
    }
    if (!currentTokens) {
      currentTokens = await singleFlight("login", () => login());
      tokenStore.set("auth", opts.email, currentTokens);
    }
    return currentTokens?.access_token ?? null;
  };

  auth.interceptors.request.use(async (cfg) => {
    const token = await ensureAccessToken();
    if (token) (cfg.headers as any).Authorization = `Bearer ${token}`;
    return cfg;
  });

  const get = async <T>(url: string, cfg?: any) =>
    (await auth.get<T>(url, cfg)).data;

  const post = async <T>(url: string, body?: any, cfg?: any) =>
    (await auth.post<T>(url, body, cfg)).data;
  
  const patch = async <T>(url: string, body?: any, cfg?: any) =>
    (await auth.patch<T>(url, body, cfg)).data;

  return {
    get,
    post,
    patch,
    logout: async () => {
      currentTokens = null;
      tokenStore.set("auth", opts.email, null as any);
    },
  };
}
