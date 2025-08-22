import fs from "fs";
import path from "path";

import { getProjectRoot } from "./utils";

import {
  FsAdapter,
  TokenStoreOptions,
} from "./types";

export class TokenStore {
  private readonly tokensDir: string;
  private readonly fs: FsAdapter;

  constructor(opts: TokenStoreOptions = {}) {
    const directoryName = opts.directoryName ?? ".playtomic";
    this.fs = opts.fsAdapter ?? {
      existsSync: fs.existsSync,
      mkdirSync: fs.mkdirSync,
      readFileSync: fs.readFileSync,
      writeFileSync: fs.writeFileSync,
      renameSync: fs.renameSync,
      openSync: fs.openSync,
      closeSync: fs.closeSync,
      fdatasyncSync: fs.fdatasyncSync,
      readdirSync: fs.readdirSync,
      unlinkSync: fs.unlinkSync,
    };

    this.tokensDir = path.resolve(getProjectRoot(), directoryName);
    this.ensureDir();
  }

  get<TTokens extends object = any>(string: string, email: string): TTokens | null {
    const file = this.resolveFile(string);
    const db = this.readJson(file);
    const key = this.normalizeEmail(email);
    return db[key] ?? null;
  }

  set<TTokens extends object = any>(string: string, email: string, tokens: TTokens): void {
    const file = this.resolveFile(string);
    const db = this.readJson(file);
    const key = this.normalizeEmail(email);
    db[key] = tokens;
    this.writeJsonAtomic(file, db);
  }

  delete(string: string, email: string): void {
    const file = this.resolveFile(string);
    const db = this.readJson(file);
    const key = this.normalizeEmail(email);
    if (db[key]) {
      delete db[key];
      this.writeJsonAtomic(file, db);
    }
  }

  exists(string: string, email: string): boolean {
    return this.get(string, email) !== null;
  }

  list<TTokens extends object = any>(string: string): Array<{ email: string; tokens: TTokens }> {
    const file = this.resolveFile(string);
    const db = this.readJson(file);
    return Object.entries(db).map(([email, tokens]) => ({
      email,
      tokens,
    }));
  }

  private ensureDir() {
    if (!this.fs.existsSync(this.tokensDir)) {
      this.fs.mkdirSync(this.tokensDir, { recursive: true });
    }
  }

  private resolveFile(string: string): string {
    const filename = `${string}.json`
    return path.join(this.tokensDir, filename);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private readJson<TTokens extends object = any>(file: string): Record<string, TTokens> {
    try {
      if (!this.fs.existsSync(file)) return {};
      const raw = this.fs.readFileSync(file, "utf-8");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, TTokens>;
      }
      return {};
    } catch {
      return {};
    }
  }

  private writeJsonAtomic(file: string, obj: object) {
    const dir = path.dirname(file);
    const tmp = path.join(
      dir,
      `${path.basename(file)}.tmp-${process.pid}-${Date.now()}`
    );
    const data = JSON.stringify(obj, null, 2);

    let fd: number | null = null;
    try {
      fd = this.fs.openSync(tmp, "w");
      this.fs.writeFileSync(fd, data, { encoding: "utf-8" });

      if (this.fs.fdatasyncSync) {
        try {
          this.fs.fdatasyncSync(fd);
        } catch {
          // Ignore if not supported
        }
      }
    } finally {
      if (fd !== null) {
        try {
          this.fs.closeSync(fd);
        } catch {
          /* ignore */
        }
      }
    }

    this.fs.renameSync(tmp, file);
  }
}
