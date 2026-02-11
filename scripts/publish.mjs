import { execSync } from "child_process";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildDir = resolve(projectRoot, "build");
const patPath = resolve(projectRoot, "..", "VsCode-Marketplace-PAT.txt");

const vsixFiles = readdirSync(buildDir).filter(f => f.endsWith(".vsix"));
if (vsixFiles.length === 0) {
  console.error(`Error: No .vsix file found in ${buildDir}. Run 'npm run build' first.`);
  process.exit(1);
}
const vsixPath = resolve(buildDir, vsixFiles[0]);

let pat;
try {
  pat = readFileSync(patPath, "utf-8").trim();
} catch {
  console.error(`Error: PAT file not found at ${patPath}`);
  console.error("Create a file named VsCode-Marketplace-PAT.txt one directory above the project root.");
  process.exit(1);
}

try {
  const command = `npx vsce publish --packagePath ${vsixPath} --pat ${pat}`;
  console.log(`> npx vsce publish --packagePath ${vsixPath} --pat ***`);
  execSync(command, { stdio: "inherit" });
} catch {
  process.exit(1);
}
