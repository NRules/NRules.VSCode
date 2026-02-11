import { execSync } from "child_process";

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit" });
}

try {
  run("npm run compile");
  run("npm test");
  run("npx vsce package");
} catch {
  process.exit(1);
}
