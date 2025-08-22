import { configDotenv } from "dotenv";

import { playtomic, chat } from "@/client";

import { getMe } from "./methods/users";
import { sendMessage } from "./methods/chat";

configDotenv();

export const main = async () => {

  const credentials = {
    email: process.env.EMAIL!,
    password: process.env.PASSWORD!,
  };

  const playtomicClient = playtomic(credentials);
  const chatClient = chat(playtomicClient);

  const me = await getMe(playtomicClient);
  const id = await sendMessage("", "", chatClient);

};

if (require.main === module) {
  main();
}
