"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  getClassById: () => getClassById,
  getClasses: () => getClasses,
  getMatchThread: () => getMatchThread,
  getMe: () => getMe,
  getTenantById: () => getTenantById,
  getTenants: () => getTenants,
  getTournamentById: () => getTournamentById,
  getTournaments: () => getTournaments,
  getUser: () => getUser,
  getUserThread: () => getUserThread,
  playtomic: () => playtomic,
  sendMessage: () => sendMessage
});
module.exports = __toCommonJS(src_exports);

// src/client/httpClient.ts
var import_axios = __toESM(require("axios"), 1);

// src/lib/token-store/index.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);

// src/lib/token-store/utils.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var getProjectRoot = () => {
  let current = __dirname;
  while (current !== import_path.default.parse(current).root) {
    if (import_fs.default.existsSync(import_path.default.join(current, "package.json"))) {
      return current;
    }
    current = import_path.default.dirname(current);
  }
  return process.cwd();
};

// src/lib/token-store/index.ts
var TokenStore = class {
  constructor(opts = {}) {
    const directoryName = opts.directoryName ?? ".playtomic";
    this.fs = opts.fsAdapter ?? {
      existsSync: import_fs2.default.existsSync,
      mkdirSync: import_fs2.default.mkdirSync,
      readFileSync: import_fs2.default.readFileSync,
      writeFileSync: import_fs2.default.writeFileSync,
      renameSync: import_fs2.default.renameSync,
      openSync: import_fs2.default.openSync,
      closeSync: import_fs2.default.closeSync,
      fdatasyncSync: import_fs2.default.fdatasyncSync,
      readdirSync: import_fs2.default.readdirSync,
      unlinkSync: import_fs2.default.unlinkSync
    };
    this.tokensDir = import_path2.default.resolve(getProjectRoot(), directoryName);
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
    return import_path2.default.join(this.tokensDir, filename);
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
    const dir = import_path2.default.dirname(file);
    const tmp = import_path2.default.join(
      dir,
      `${import_path2.default.basename(file)}.tmp-${process.pid}-${Date.now()}`
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

// src/client/httpClient.ts
var createHttpClient = (opts) => {
  if (!opts.email || !opts.password)
    throw new Error("missing params");
  const baseURL = opts.baseURL ?? "https://api.playtomic.io";
  const headers = {};
  const tokenStore = new TokenStore({ directoryName: ".playtomic" });
  let currentTokens = null;
  const inflight = {};
  const raw = import_axios.default.create({ baseURL, headers });
  const auth = import_axios.default.create({ baseURL, headers });
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
  const get = async (url, cfg) => {
    const res = await auth.get(url, cfg);
    console.log(res.config.params);
    return res.data;
  };
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
};

// src/client/chatClient.ts
var import_app = require("firebase/app");
var import_auth = require("firebase/auth");
var import_database = require("firebase/database");
var createChatClient = (httpClient) => {
  const app = (0, import_app.getApps)().length ? (0, import_app.getApps)()[0] : (0, import_app.initializeApp)({
    apiKey: "AIzaSyAU3tWfb04J6AyouierS5NI0mkc_Xbwi40",
    projectId: "fir-playtomic",
    authDomain: "fir-playtomic.firebaseapp.com",
    databaseURL: "https://fir-playtomic.firebaseio.com",
    storageBucket: "fir-playtomic.appspot.com"
  });
  const auth = (0, import_auth.getAuth)(app);
  const database = (0, import_database.getDatabase)(app);
  let initialized = null;
  const getChatCustomToken = async () => {
    const data = await httpClient.post("/v1/chats/tokens", {
      user_id: "me"
    });
    if (!data?.token)
      throw new Error("no chat token");
    return data.token;
  };
  const ensureSignedIn = async () => {
    if (auth.currentUser)
      return;
    if (!initialized) {
      initialized = (async () => {
        await (0, import_auth.setPersistence)(auth, import_auth.inMemoryPersistence);
        let token = await getChatCustomToken();
        try {
          await (0, import_auth.signInWithCustomToken)(auth, token);
        } catch (e) {
          token = await getChatCustomToken();
          await (0, import_auth.signInWithCustomToken)(auth, token);
        }
      })().finally(() => {
        initialized = null;
      });
    }
    await initialized;
  };
  return { ...httpClient, ensureSignedIn, auth, database };
};

// src/client/index.ts
var playtomic = (opts) => {
  const httpClient = createHttpClient(opts);
  const client = createChatClient(httpClient);
  return client;
};

// src/methods/chat.ts
var import_database2 = require("firebase/database");
var getUserThread = async (client, userId) => {
  try {
    const { thread_id } = await client.post(
      `/v1/chats`,
      {
        user_id: "me",
        type: "USER",
        object_id: userId
      }
    );
    return thread_id;
  } catch (e) {
    throw new Error(`failed to get thread from user ${userId}: `);
  }
};
var getMatchThread = async (client, matchId) => {
  try {
    const { thread_id } = await client.post(
      `/v1/chats`,
      {
        user_id: "me",
        type: "MATCH",
        object_id: matchId
      }
    );
    return thread_id;
  } catch (e) {
    throw new Error(`failed to get thread from user ${matchId}: `);
  }
};
var sendMessage = async (client, text, threadId) => {
  try {
    await client.ensureSignedIn();
    const uid = client.auth.currentUser?.uid;
    if (!uid)
      throw new Error("no authorized user");
    const messagesRef = (0, import_database2.ref)(client.database, `chat/messages/${threadId}`);
    const newMessageRef = (0, import_database2.push)(messagesRef);
    const message = {
      data: { text, type: "text" },
      date: (0, import_database2.serverTimestamp)(),
      user_id: uid
    };
    await (0, import_database2.set)(newMessageRef, message);
    if (!newMessageRef.key)
      throw new Error("failed to get message id");
    return newMessageRef.key;
  } catch (e) {
    throw new Error(
      `failed to send message to thread ${threadId}: ${e.message}`
    );
  }
};

// src/methods/class.ts
var getClasses = async (client, opts) => {
  try {
    const classes = await client.get(`/v1/classes`, {
      params: {
        ...opts?.tenantId && { tenant_id: opts.tenantId },
        ...opts?.from && { start_date_from: opts.from },
        ...opts?.until && { start_date_to: opts.until }
      }
    });
    return classes;
  } catch (e) {
    throw new Error(`failed to get classes: ${e}`);
  }
};
var getClassById = async (client, classId) => {
  try {
    const classes = await client.get(`/v1/classes/${classId}`);
    return classes;
  } catch (e) {
    throw new Error(`failed to get class ${classId}: ${e}`);
  }
};

// src/methods/tenant.ts
var getTenants = async (client, opts) => {
  try {
    const tenants = await client.get(`/v1/tenants`, {
      params: {
        ...opts?.coordinates && {
          coordinate: `${opts.coordinates.lat},${opts.coordinates.lon}`
        },
        ...opts?.radius && { radius: opts.radius }
      }
    });
    return tenants;
  } catch (e) {
    throw new Error(`failed to get tenants: ${e}`);
  }
};
var getTenantById = async (client, tenantId) => {
  try {
    const tenant = await client.get(`/v1/tenants/${tenantId}`);
    return tenant;
  } catch (e) {
    throw new Error(`failed to get tenant ${tenantId}: ${e}`);
  }
};

// src/methods/tournament.ts
var getTournaments = async (client, opts) => {
  try {
    const tournaments = await client.get(`/v1/tournaments`, {
      params: {
        ...opts?.tenantId && { tenant_id: opts.tenantId },
        ...opts?.from && { start_date_from: opts.from },
        ...opts?.until && { start_date_to: opts.until }
      }
    });
    return tournaments;
  } catch (e) {
    throw new Error(`failed to get classes: ${e}`);
  }
};
var getTournamentById = async (client, tournamentId) => {
  try {
    const classes = await client.get(`/v1/tournamets/${tournamentId}`);
    return classes;
  } catch (e) {
    throw new Error(`failed to get tournament ${tournamentId}: ${e}`);
  }
};

// src/methods/users.ts
async function getMe(client) {
  const user = await client.get(`/v2/users/me`);
  if (!user)
    throw new Error("failed to get me");
  return user;
}
async function getUser(client, id) {
  const user = await client.get(`/v2/users/${id}`);
  if (!user)
    return null;
  return user;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getClassById,
  getClasses,
  getMatchThread,
  getMe,
  getTenantById,
  getTenants,
  getTournamentById,
  getTournaments,
  getUser,
  getUserThread,
  playtomic,
  sendMessage
});
//# sourceMappingURL=index.cjs.map