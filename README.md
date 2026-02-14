# NRules Visualizer for VS Code

A Visual Studio Code extension that visualizes the [NRules](https://github.com/NRules/NRules) Rete network as an interactive graph during debugging. It retrieves DGML graph data from the NRules runtime via the Debug Adapter Protocol (DAP) and renders it using Cytoscape.js with automatic hierarchical layout.

The extension is available at the VS Code marketplace: [NRules Visualizer](https://marketplace.visualstudio.com/items?itemName=nrules.vscode-nrules-visualizer)

## Features

- **Schema Visualizer** — Displays the structure of the NRules Rete network, showing how the nodes are connected.
- **Performance Visualizer** — Overlays performance metrics from the NRules session onto the network graph and dynamically styles the graph to highlight performance bottlenecks.
- **Interactive Graph** — Pan, zoom, and hover over nodes to see their detailed properties in a tooltip.

Example visualizations:

![NRules Visualizer](media/NRules-Visualizer-Schema.png)

![NRules Visualizer with Tooltip](media/NRules-Visualizer-Tooltip.png)

## Prerequisites

- Visual Studio Code 1.100.0 or later
- A .NET application using [NRules](https://github.com/NRules/NRules)
- The C# debugger extension for VS Code

## Usage

1. Start a debug session for your .NET application that uses NRules.
2. Set a breakpoint where an `NRules.ISession` variable is in scope.
3. When the debugger pauses, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run one of:
   - **NRules Visualizer** — to view the Rete network schema
   - **NRules Performance Visualizer** — to view the Rete network with performance metrics
4. The extension automatically finds the NRules session variable in the current stack frame, extracts the DGML graph, and renders it in a webview panel.

## Development

### Build

```bash
npm run compile          # esbuild bundle + vendor copy
npm run compile:types    # TypeScript type-check only (no emit)
```

### Test

```bash
npm test
```

### Package

```bash
npm run build            # type-check, bundle, test, produce .vsix in build/
```

### Debug

Use the **Run Extension** launch configuration in VS Code to open an Extension Development Host with the extension loaded.