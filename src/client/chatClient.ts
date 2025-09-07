import {
  Playtomic,
  PlaytomicHttpClient,
} from "@/types/client.types.js";

import { initializeApp, getApps } from "firebase/app";

import {
  getAuth,
  signInWithCustomToken,
  setPersistence,
  inMemoryPersistence,
} from "firebase/auth";

import { getDatabase } from "firebase/database";

export const createChatClient = (
  httpClient: PlaytomicHttpClient
): Playtomic => {

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        apiKey: "AIzaSyAU3tWfb04J6AyouierS5NI0mkc_Xbwi40",
        projectId: "fir-playtomic",
        authDomain: "fir-playtomic.firebaseapp.com",
        databaseURL: "https://fir-playtomic.firebaseio.com",
        storageBucket: "fir-playtomic.appspot.com",
      });

  const auth = getAuth(app);
  const database = getDatabase(app);

  let initialized: Promise<void> | null = null;

  /**
   * gets the custom token required to auth with rtdb
   */
  const getChatCustomToken = async (): Promise<string> => {
    const data = await httpClient.post<{ token: string }>("/v1/chats/tokens", {
      user_id: "me",
    });
    if (!data?.token) throw new Error("no chat token");
    return data.token;
  };

  /**
   * makes sure our firebase instance is authorized
   */
  const ensureSignedIn = async (): Promise<void> => {
    if (auth.currentUser) return;

    if (!initialized) {
      initialized = (async () => {
        await setPersistence(auth, inMemoryPersistence);
        let token = await getChatCustomToken();
        try {
          await signInWithCustomToken(auth, token);
        } catch (e: any) {
          token = await getChatCustomToken();
          await signInWithCustomToken(auth, token);
        }
      })().finally(() => {
        initialized = null;
      });
    }
    await initialized;
  };

  return { ...httpClient, ensureSignedIn, auth, database };
};
