import fs from "fs";


/**
 * Optional FS adapter to ease testing/mocking.
 */
export interface FsAdapter {
  existsSync: typeof fs.existsSync;
  mkdirSync: typeof fs.mkdirSync;
  readFileSync: typeof fs.readFileSync;
  writeFileSync: typeof fs.writeFileSync;
  renameSync: typeof fs.renameSync;
  openSync: typeof fs.openSync;
  closeSync: typeof fs.closeSync;
  fdatasyncSync?: typeof fs.fdatasyncSync;
  readdirSync: typeof fs.readdirSync;
  unlinkSync: typeof fs.unlinkSync;
}

export interface TokenStoreOptions {
  /** Directory under project root where token files live. Defaults to `.playtomic`. */
  directoryName?: string;
  /** Inject a custom fs adapter for tests. */
  fsAdapter?: FsAdapter;
}