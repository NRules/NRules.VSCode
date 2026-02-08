# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code debugger visualizer extension for the NRules rules engine. During a debug session, it retrieves DGML graph data from the NRules runtime via DAP (Debug Adapter Protocol) and renders an interactive node graph using Cytoscape.js in a webview panel.

## Build & Development Commands

```bash
npm run compile      # Compile TypeScript to out/
npm test             # Run VS Code extension tests (requires vscode-test)
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
- **@vscode/test-cli + @vscode/test-electron** — VS Code extension test infrastructure

## TypeScript Configuration

Strict mode enabled with additional checks: `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedParameters`. 

## ESLint Rules

Enforces camelCase/PascalCase naming for imports, requires curly braces, strict equality (`===`), semicolons, and no throw literals.
