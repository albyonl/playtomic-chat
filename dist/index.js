var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// src/client/base.ts
import axios from "axios";

// src/token-store/index.ts
import fs2 from "fs";
import path2 from "path";

// src/utils/dir.ts
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

// src/token-store/index.ts
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
    this.axiosInstance = axios.create({ baseURL, headers });
    this.authInstance = axios.create({ baseURL, headers });
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
import { configDotenv } from "dotenv";
configDotenv();
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
if (__require.main === module) {
  main();
}
export {
  main
};
//# sourceMappingURL=index.js.map