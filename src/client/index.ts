import { Playtomic, PlaytomicClientOpts } from "@/types/client.types.js";
import { createHttpClient } from "./httpClient.js";
import { createChatClient } from "./chatClient.js";

export const playtomic = (opts: PlaytomicClientOpts): Playtomic => {
    const httpClient = createHttpClient(opts);
    const client = createChatClient(httpClient);
    return client;
}

export { createHttpClient } from './httpClient.js';
export { createChatClient } from './chatClient.js';

