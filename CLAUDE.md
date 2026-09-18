# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code debugger visualizer extension for the NRules rules engine. During a debug session, it retrieves DGML graph data from the NRules runtime via DAP (Debug Adapter Protocol) and renders an interactive node graph using Cytoscape.js in a webview panel.

## Build & Development Commands

```bash
npm run compile      # Bundle src/extension.ts to out/extension.js via esbuild
npm run compile:types # Type-check only (tsc --noEmit)
npm run lint         # Lint src with ESLint
npm test             # Compile with tsc and run the mocha unit tests
npm run build        # Full release build: types, bundle, tests, vsce package -> build/
```

To debug the extension: use the "Run Extension" launch configuration in VS Code, which opens an Extension Development Host.

## Architecture

The extension follows a pipeline: **Debugger → Parser → Visualizer**

1. **`extension.ts`** — Entry point. Registers the extension commands, creates a webview panel, and orchestrates the pipeline.

2. **`debuggerProxy.ts`** — Communicates with the active VS Code debug session via DAP.

3. **`dgml.ts`** — TypeScript interfaces for the DGML directed graph model.

4. **`dgmlParser.ts`** — Parses DGML XML strings into typed objects using `xml2js`.

5. **`webviewContent.ts`** — Generates the webview HTML with embedded Cytoscape.js configuration (elements, styles, ELK layout). Nodes with category "Rule" get distinct purple styling.

## Key Dependencies

- **cytoscape + cytoscape-elk + elkjs** — Graph visualization and automatic hierarchical layout
- **xml2js** — XML parsing for DGML data from the debugger
- **esbuild** — Bundles the extension and copies webview vendor files (`scripts/esbuild.mjs`)
- **mocha** — Unit test runner, configured via `.mocharc.yml` against compiled output in `out/test/`
- **@vscode/vsce** — Packages and publishes the extension

## TypeScript Configuration

Strict mode enabled with additional checks: `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedParameters`. 

## ESLint Rules

Enforces camelCase/PascalCase naming for imports, requires curly braces, strict equality (`===`), semicolons, and no throw literals.
