import { configDotenv } from "dotenv";

import { getUser } from "./methods/users";

import { playtomic } from "./client/playtomic";
import { playtomicChat } from "./client/playtomicChat";
import { sendMessage } from "./methods/chat";

configDotenv();

export const main = async () => {

  const params = {
    email: process.env.EMAIL!,
    password: process.env.PASSWORD!,
  };

  const http = playtomic(params);
  const rtdb = playtomicChat(http);

  const threadId = "u:10902581:5564611";

  await sendMessage(threadId, "hello", rtdb);

};

if (require.main === module) {
  main();
}
