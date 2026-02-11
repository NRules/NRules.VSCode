# NRules Visualizer for VS Code

A Visual Studio Code extension that visualizes the [NRules](https://github.com/NRules/NRules) Rete network as an interactive graph during debugging. It retrieves DGML graph data from the NRules runtime via the Debug Adapter Protocol (DAP) and renders it using Cytoscape.js with automatic hierarchical layout.

## Features

- **Schema Visualizer** — Displays the structure of the NRules Rete network, showing how rules, conditions, and joins are connected.
- **Performance Visualizer** — Overlays performance metrics from the NRules session onto the network graph.
- **Interactive Graph** — Pan, zoom, and hover over nodes to see their properties in a tooltip.

## Prerequisites

- Visual Studio Code 1.100.0 or later
- A .NET application using [NRules](https://github.com/NRules/NRules)
- The C# debugger extension for VS Code

## Usage

1. Start a debug session for your .NET application that uses NRules.
2. Set a breakpoint where an `NRules.ISession` variable is in scope.
3. When the debugger pauses, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run one of:
   - **Show NRules Visualizer** — to view the Rete network schema
   - **Show NRules Performance Visualizer** — to view the Rete network with performance metrics
4. The extension automatically finds the NRules session variable in the current stack frame, extracts the DGML graph, and renders it in a webview panel.

## Development

### Build

```bash
npm install
npm run compile
```

### Test

```bash
npm test
```

### Debug

Use the **Run Extension** launch configuration in VS Code to open an Extension Development Host with the extension loaded.