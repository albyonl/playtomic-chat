import { Playtomic } from "@/types/clients.types";
import { Me } from "@/types/me.types";
import { User } from "@/types/user.types";

export async function getMe(client: Playtomic): Promise<Me> {
    const user = await client.get<Me>(`/v2/users/me`);
    if(!user) throw new Error("failed to get me");
    return user;
}

export async function getUser(id: string, client: Playtomic): Promise<User | null> {
    const user = await client.get<User>(`/v2/users/${id}`);
    if(!user) return null;
    return user;
}