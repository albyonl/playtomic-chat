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
  main: () => main
});
module.exports = __toCommonJS(src_exports);

// src/client/base.ts
var import_axios = __toESM(require("axios"), 1);

// src/token-store/index.ts
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);

// src/utils/dir.ts
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

// src/token-store/index.ts
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

// src/client/base.ts
var BasePlaytomicClient = class {
  constructor(options) {
    this.currentTokens = null;
    this.refreshPromise = null;
    if (!options.email || !options.password)
      throw new Error("invalid email or password");
    const baseURL = options.baseUrl || "https://api.playtomic.io";
    const headers = { "Content-Type": "application/json" };
    this.email = options.email;
    this.password = options.password;
    this.tokenStore = new TokenStore({
      directoryName: ".playtomic"
    });
    this.axiosInstance = import_axios.default.create({ baseURL, headers });
    this.authInstance = import_axios.default.create({ baseURL, headers });
    this.attachInterceptors();
  }
  attachInterceptors() {
    this.authInstance.interceptors.request.use(async (config) => {
      const token = await this.ensureValidAccessToken();
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });
  }
  async ensureValidAccessToken() {
    console.log("[ensureValidAccessToken] Start");
    if (this.currentTokens && !this.isExpired(this.currentTokens.access_token_expiration)) {
      console.log("[ensureValidAccessToken] Using existing valid access token");
      return this.currentTokens.access_token;
    }
    if (!this.currentTokens) {
      console.log("[ensureValidAccessToken] No current tokens, fetching from store");
      this.currentTokens = this.tokenStore.get("auth", this.email);
    }
    if (this.currentTokens && this.isExpired(this.currentTokens.access_token_expiration)) {
      console.log("[ensureValidAccessToken] Access token expired");
      if (!this.isExpired(this.currentTokens.refresh_token_expiration)) {
        console.log("[ensureValidAccessToken] Refresh token valid, refreshing...");
        await this.runSingleRefresh(async () => {
          console.log("[ensureValidAccessToken] Inside runSingleRefresh");
          const refreshed = await this.refresh(this.currentTokens.refresh_token);
          console.log("[ensureValidAccessToken] Refresh successful");
          this.currentTokens = refreshed;
          this.tokenStore.set("auth", this.email, refreshed);
          return refreshed;
        });
      } else {
        console.log("[ensureValidAccessToken] Refresh token expired, clearing tokens");
        this.currentTokens = null;
      }
    }
    if (!this.currentTokens) {
      console.log("[ensureValidAccessToken] Logging in to get new tokens");
      const loggedIn = await this.login();
      console.log("[ensureValidAccessToken] Login successful");
      this.currentTokens = loggedIn;
      this.tokenStore.set("auth", this.email, loggedIn);
    }
    console.log("[ensureValidAccessToken] Returning access token");
    return this.currentTokens?.access_token ?? null;
  }
  async runSingleRefresh(fn) {
    if (!this.refreshPromise) {
      this.refreshPromise = fn().catch(() => null).finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }
  async refresh(refreshToken) {
    try {
      const { data } = await this.axiosInstance.post(
        "/v3/auth/token",
        { refresh_token: refreshToken }
      );
      return data;
    } catch {
      throw new Error("failed to refresh token");
    }
  }
  async login() {
    try {
      const { data } = await this.axiosInstance.post(
        "/v3/auth/login",
        { email: this.email, password: this.password }
      );
      return data;
    } catch (e) {
      console.error(e);
      throw new Error("failed to login with provided credentials");
    }
  }
  isExpired(isoWithoutZ) {
    const expiresAt = new Date(isoWithoutZ + suffixZ(isoWithoutZ)).getTime();
    const now = Date.now();
    const skew = 30 * 1e3;
    return now + skew >= expiresAt;
  }
};

// src/client/index.ts
var PlaytomicClient = class extends BasePlaytomicClient {
  /**
   * retreives the current user object
   * @returns
   */
  async getMe() {
    try {
      const response = await this.authInstance.get("/v2/users/me");
      if (!response.data)
        throw new Error("failed to get me");
      return response.data;
    } catch (e) {
      console.error(e);
      throw new Error("failed to get profile");
    }
  }
  /**
   * upserts the current client user
   */
  async updateMe(me) {
    try {
      const response = await this.authInstance.patch("/v2/users/me", me);
      if (!response.data)
        throw new Error("me not found");
      return response.data;
    } catch (e) {
      throw new Error("failed to get me");
    }
  }
  /**
   * gets a user by their id
   */
  async getUser(id) {
    try {
      const response = await this.authInstance.get(`/v2/users/${id}`);
      if (!response.data)
        return null;
      return response.data;
    } catch (e) {
      throw new Error("failed to get user");
    }
  }
};

// src/index.ts
var import_dotenv = require("dotenv");
(0, import_dotenv.configDotenv)();
var client = new PlaytomicClient({
  email: process.env.EMAIL,
  password: process.env.PASSWORD
});
var main = async () => {
  const me = await client.getMe();
  console.log(me);
  const someone = await client.getUser("6790013");
  console.log("someone");
};
if (require.main === module) {
  main();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
//# sourceMappingURL=index.cjs.map