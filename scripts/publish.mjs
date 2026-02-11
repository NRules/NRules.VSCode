import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const patPath = resolve(projectRoot, "..", "VsCode-Marketplace-PAT.txt");

let pat;
try {
  pat = readFileSync(patPath, "utf-8").trim();
} catch {
  console.error(`Error: PAT file not found at ${patPath}`);
  console.error("Create a file named VsCode-Marketplace-PAT.txt one directory above the project root.");
  process.exit(1);
}

try {
  const command = `npx vsce publish --pat ${pat}`;
  console.log("> npx vsce publish --pat ***");
  execSync(command, { stdio: "inherit" });
} catch {
  process.exit(1);
}
