import {
  PlaytomicChatClient,
  PlaytomicHttpClient,
} from "@/types/client.types.js";

import { push, ref, serverTimestamp, set } from "firebase/database";

/**
 * gets the thread id from a user
 */
export const getUserThread = async (
  client: PlaytomicHttpClient,
  userId: string
): Promise<string> => {
  try {
    const { thread_id } = await client.post<{ thread_id: string }>(
      `/v1/chats`,
      {
        user_id: "me",
        type: "USER",
        object_id: userId,
      }
    );
    return thread_id;
  } catch (e: any) {
    throw new Error(`failed to get thread from user ${userId}: `);
  }
};

/**
 * gets the thread id from a user
 */
export const getMatchThread = async (
  client: PlaytomicHttpClient,
  matchId: string
): Promise<string> => {
  try {
    const { thread_id } = await client.post<{ thread_id: string }>(
      `/v1/chats`,
      {
        user_id: "me",
        type: "MATCH",
        object_id: matchId,
      }
    );
    return thread_id;
  } catch (e: any) {
    throw new Error(`failed to get thread from user ${matchId}: `);
  }
};

/**
 * sends message to a thread
 */
export const sendMessage = async (
  client: PlaytomicChatClient,
  text: string,
  threadId: string
): Promise<string> => {
  try {
    await client.ensureSignedIn();

    const uid = client.auth.currentUser?.uid;
    if (!uid) throw new Error("no authorized user");

    const messagesRef = ref(client.database, `chat/messages/${threadId}`);
    const newMessageRef = push(messagesRef);

    const message = {
      data: { text, type: "text" },
      date: serverTimestamp(),
      user_id: uid,
    };

    await set(newMessageRef, message);

    if (!newMessageRef.key) throw new Error("failed to get message id");
    return newMessageRef.key;
  } catch (e: any) {
    throw new Error(
      `failed to send message to thread ${threadId}: ${e.message}`
    );
  }
};
