import { execSync } from "child_process";
import { rmSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildDir = resolve(projectRoot, "build");

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit" });
}

try {
  rmSync(buildDir, { recursive: true, force: true });
  mkdirSync(buildDir, { recursive: true });

  run("npm run compile");
  run("npm test");
  run(`npx vsce package --out build/`);
} catch {
  process.exit(1);
}
