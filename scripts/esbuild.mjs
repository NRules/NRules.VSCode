import * as esbuild from "esbuild";
import { cpSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

// Copy webview vendor files from node_modules to media/vendor
function copyVendorFiles() {
  const vendorDir = resolve(projectRoot, "media", "vendor");
  mkdirSync(vendorDir, { recursive: true });

  const vendorFiles = [
    ["node_modules/cytoscape/dist/cytoscape.min.js", "cytoscape.min.js"],
    ["node_modules/elkjs/lib/elk.bundled.js", "elk.bundled.js"],
    ["node_modules/cytoscape-elk/dist/cytoscape-elk.js", "cytoscape-elk.js"],
  ];

  for (const [src, dest] of vendorFiles) {
    cpSync(resolve(projectRoot, src), resolve(vendorDir, dest));
  }

  console.log("Copied vendor files to media/vendor/");
}

/** @type {import('esbuild').Plugin} */
const esbuildProblemMatcherPlugin = {
  name: "esbuild-problem-matcher",
  setup(build) {
    build.onStart(() => {
      console.log("[watch] build started");
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location) {
          console.error(`    ${location.file}:${location.line}:${location.column}:`);
        }
      });
      copyVendorFiles();
      console.log("[watch] build finished");
    });
  },
};

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: "node",
    target: "ES2022",
    outfile: "out/extension.js",
    external: ["vscode"],
    logLevel: "silent",
    plugins: [esbuildProblemMatcherPlugin],
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
