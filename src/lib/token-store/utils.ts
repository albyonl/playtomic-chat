import fs from "fs";
import path from "path";

export const getProjectRoot = (): string => {
  let current = __dirname;
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, "package.json"))) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd(); // fallback
};
