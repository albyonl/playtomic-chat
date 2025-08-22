var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// src/index.ts
import { configDotenv } from "dotenv";

// src/client/playtomic.ts
import axios from "axios";

// src/lib/token-store/index.ts
import fs2 from "fs";
import path2 from "path";

// src/lib/token-store/utils.ts
import fs from "fs";
import path from "path";
var getProjectRoot = () => {
  let current = __dirname;
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, "package.json"))) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd();
};

// src/lib/token-store/index.ts
var TokenStore = class {
  constructor(opts = {}) {
    const directoryName = opts.directoryName ?? ".playtomic";
    this.fs = opts.fsAdapter ?? {
      existsSync: fs2.existsSync,
      mkdirSync: fs2.mkdirSync,
      readFileSync: fs2.readFileSync,
      writeFileSync: fs2.writeFileSync,
      renameSync: fs2.renameSync,
      openSync: fs2.openSync,
      closeSync: fs2.closeSync,
      fdatasyncSync: fs2.fdatasyncSync,
      readdirSync: fs2.readdirSync,
      unlinkSync: fs2.unlinkSync
    };
    this.tokensDir = path2.resolve(getProjectRoot(), directoryName);
    this.ensureDir();
  }
  get(string, email) {
    const file = this.resolveFile(string);
    const db = this.readJson(file);
    const key = this.normalizeEmail(email);
    return db[key] ?? null;
  }
  set(string, email, tokens) {
    const file = this.resolveFile(string);
    const db = this.readJson(file);
    const key = this.normalizeEmail(email);
    db[key] = tokens;
    this.writeJsonAtomic(file, db);
  }
  delete(string, email) {
    const file = this.resolveFile(string);
    const db = this.readJson(file);
    const key = this.normalizeEmail(email);
    if (db[key]) {
      delete db[key];
      this.writeJsonAtomic(file, db);
    }
  }
  exists(string, email) {
    return this.get(string, email) !== null;
  }
  list(string) {
    const file = this.resolveFile(string);
    const db = this.readJson(file);
    return Object.entries(db).map(([email, tokens]) => ({
      email,
      tokens
    }));
  }
  ensureDir() {
    if (!this.fs.existsSync(this.tokensDir)) {
      this.fs.mkdirSync(this.tokensDir, { recursive: true });
    }
  }
  resolveFile(string) {
    const filename = `${string}.json`;
    return path2.join(this.tokensDir, filename);
  }
  normalizeEmail(email) {
    return email.trim().toLowerCase();
  }
  readJson(file) {
    try {
      if (!this.fs.existsSync(file))
        return {};
      const raw = this.fs.readFileSync(file, "utf-8");
      if (!raw)
        return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }
  writeJsonAtomic(file, obj) {
    const dir = path2.dirname(file);
    const tmp = path2.join(
      dir,
      `${path2.basename(file)}.tmp-${process.pid}-${Date.now()}`
    );
    const data = JSON.stringify(obj, null, 2);
    let fd = null;
    try {
      fd = this.fs.openSync(tmp, "w");
      this.fs.writeFileSync(fd, data, { encoding: "utf-8" });
      if (this.fs.fdatasyncSync) {
        try {
          this.fs.fdatasyncSync(fd);
        } catch {
        }
      }
    } finally {
      if (fd !== null) {
        try {
          this.fs.closeSync(fd);
        } catch {
        }
      }
    }
    this.fs.renameSync(tmp, file);
  }
};

// src/utils/iso.ts
var suffixZ = (iso) => {
  return isoHasTZ(iso) ? "" : "Z";
};
var isoHasTZ = (str) => {
  return /[zZ]|[+\-]\d{2}:?\d{2}$/.test(str);
};

// src/client/playtomic.ts
function playtomic(opts) {
  if (!opts.email || !opts.password)
    throw new Error("missing params");
  const baseURL = opts.baseURL ?? "https://api.playtomic.io";
  const headers = {};
  const tokenStore = new TokenStore({ directoryName: ".playtomic" });
  let currentTokens = null;
  const inflight = {};
  const raw = axios.create({ baseURL, headers });
  const auth = axios.create({ baseURL, headers });
  const singleFlight = (k, fn) => {
    if (!inflight[k])
      inflight[k] = fn().finally(() => inflight[k] = null);
    return inflight[k];
  };
  const isExpired = (isoWithoutZ) => Date.now() + 3e4 >= new Date(isoWithoutZ + suffixZ(isoWithoutZ)).getTime();
  const login = async () => (await raw.post("/v3/auth/login", {
    email: opts.email,
    password: opts.password
  })).data;
  const refresh = async (rt) => (await raw.post("/v3/auth/token", { refresh_token: rt })).data;
  const ensureAccessToken = async () => {
    if (currentTokens && !isExpired(currentTokens.access_token_expiration))
      return currentTokens.access_token;
    if (!currentTokens)
      currentTokens = tokenStore.get("auth", opts.email) ?? null;
    if (currentTokens && isExpired(currentTokens.access_token_expiration)) {
      if (!isExpired(currentTokens.refresh_token_expiration)) {
        try {
          currentTokens = await singleFlight(
            "refresh",
            () => refresh(currentTokens.refresh_token)
          );
          tokenStore.set("auth", opts.email, currentTokens);
        } catch {
          currentTokens = null;
        }
      } else
        currentTokens = null;
    }
    if (!currentTokens) {
      currentTokens = await singleFlight("login", () => login());
      tokenStore.set("auth", opts.email, currentTokens);
    }
    return currentTokens?.access_token ?? null;
  };
  auth.interceptors.request.use(async (cfg) => {
    const token = await ensureAccessToken();
    if (token)
      cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
  const get = async (url, cfg) => (await auth.get(url, cfg)).data;
  const post = async (url, body, cfg) => (await auth.post(url, body, cfg)).data;
  const patch = async (url, body, cfg) => (await auth.patch(url, body, cfg)).data;
  return {
    get,
    post,
    patch,
    logout: async () => {
      currentTokens = null;
      tokenStore.set("auth", opts.email, null);
    }
  };
}

// src/client/playtomicChat.ts
import { AxiosError } from "axios";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  setPersistence,
  inMemoryPersistence
} from "firebase/auth";
import { getDatabase } from "firebase/database";
var playtomicChat = (api) => {
  const app = getApps().length ? getApps()[0] : initializeApp({
    apiKey: "AIzaSyAU3tWfb04J6AyouierS5NI0mkc_Xbwi40",
    projectId: "fir-playtomic",
    authDomain: "fir-playtomic.firebaseapp.com",
    databaseURL: "https://fir-playtomic.firebaseio.com",
    storageBucket: "fir-playtomic.appspot.com"
  });
  const auth = getAuth(app);
  const database = getDatabase(app);
  let initialized = null;
  const getChatCustomToken = async () => {
    try {
      const data = await api.post("/v1/chats/tokens", {
        user_id: "me"
      });
      if (!data?.token)
        throw new Error("no chat token");
      return data.token;
    } catch (e) {
      if (e instanceof AxiosError) {
        console.error(e.request);
      }
      console.error(`failed to get custom chat token ${e.message}`);
      throw "";
    }
  };
  const ensureSignedIn = async () => {
    if (auth.currentUser)
      return;
    if (!initialized) {
      initialized = (async () => {
        await setPersistence(auth, inMemoryPersistence);
        let token = await getChatCustomToken();
        try {
          await signInWithCustomToken(auth, token);
        } catch (e) {
          token = await getChatCustomToken();
          await signInWithCustomToken(auth, token);
        }
      })().finally(() => {
        initialized = null;
      });
    }
    await initialized;
  };
  return { ensureSignedIn, auth, database };
};

// src/methods/chat.ts
import { push, ref, serverTimestamp, set } from "firebase/database";
var sendMessage = async (threadId, text, client) => {
  await client.ensureSignedIn();
  const uid = client.auth.currentUser?.uid;
  if (!uid)
    throw new Error("no authorized user");
  const messagesRef = ref(client.database, `chat/messages/${threadId}`);
  const newMessageRef = push(messagesRef);
  const message = {
    data: { text, type: "text" },
    date: serverTimestamp(),
    user_id: uid
  };
  await set(newMessageRef, message);
  if (!newMessageRef.key)
    throw new Error("failed to get message id");
  return newMessageRef.key;
};

// src/index.ts
configDotenv();
var main = async () => {
  const params = {
    email: process.env.EMAIL,
    password: process.env.PASSWORD
  };
  const http = playtomic(params);
  const rtdb = playtomicChat(http);
  const threadId = "u:10902581:5564611";
  await sendMessage(threadId, "hello", rtdb);
};
if (__require.main === module) {
  main();
}
export {
  main
};
//# sourceMappingURL=index.js.map