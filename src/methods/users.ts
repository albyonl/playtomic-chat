import { PlaytomicHttpClient } from "@/types/client.types.js";
import { Me } from "@/types/me.types.js";
import { User } from "@/types/user.types.js";

export async function getMe(client: PlaytomicHttpClient): Promise<Me> {
  const user = await client.get<Me>(`/v2/users/me`);
  if (!user) throw new Error("failed to get me");
  return user;
}

export async function getUser(
  client: PlaytomicHttpClient,
  id: string
): Promise<User | null> {
  const user = await client.get<User>(`/v2/users/${id}`);
  if (!user) return null;
  return user;
}
