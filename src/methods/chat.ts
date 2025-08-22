import { Chat } from "@/types/clients.types";
import { push, ref, serverTimestamp, set } from "firebase/database";

export const sendMessage = async (
  threadId: string,
  text: string,
  client: Chat
): Promise<string> => {
  
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
};
