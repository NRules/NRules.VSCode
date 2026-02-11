import * as vscode from 'vscode';
import { DirectedGraph } from './dgml';
import { VisualizerMode } from './visualizerMode';

export class WebviewContentProvider {
    constructor(private readonly webview: vscode.Webview, private readonly extensionUri: vscode.Uri) {}

    private getCytoscapePath(): vscode.Uri {
        return this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'vendor', 'cytoscape.min.js')
        );
    }

    private getElkPath(): vscode.Uri {
        return this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'vendor', 'elk.bundled.js')
        );
    }

    private getCytoscapeElkPath(): vscode.Uri {
        return this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'vendor', 'cytoscape-elk.js')
        );
    }

    private getScriptPath(): vscode.Uri {
        return this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'webviewScript.js')
        );
    }

    private getStylesheetPath(): vscode.Uri {
        return this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.css')
        );
    }

    private getHeadContent(): string {
        const cytoscapePath = this.getCytoscapePath();
        const elkPath = this.getElkPath();
        const cytoscapeElkPath = this.getCytoscapeElkPath();
        const stylesheetPath = this.getStylesheetPath();

        return `
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NRules Visualizer</title>
            <link rel="stylesheet" href="${stylesheetPath}">
            <script src="${cytoscapePath}"></script>
            <script src="${elkPath}"></script>
            <script src="${cytoscapeElkPath}"></script>
        `;
    }

    private getBodyContent(graph: DirectedGraph, mode: VisualizerMode): string {
        const scriptPath = this.getScriptPath();
        return `
            <div id="cy"></div>
            <div id="tooltip"></div>
            <script>
                window.nrGraphData = ${JSON.stringify(this.getCytoscapeElements(graph))};
                window.nrVisualizerMode = ${JSON.stringify(mode)};
            </script>
            <script src="${scriptPath}"></script>
        `;
    }

    private getCytoscapeElements(graph: DirectedGraph): any[] {
        const elements: any[] = [];

        if (graph.Nodes && graph.Nodes[0] && graph.Nodes[0].Node) {
            graph.Nodes[0].Node.forEach(node => {
                const { Id, Label, Category, ...rest } = node.$;
                elements.push({
                    data: {
                        id: Id,
                        label: Label || Category || Id,
                        category: Category,
                        properties: { Id, Label, Category, ...rest }
                    }
                });
            });
        }

        if (graph.Links && graph.Links[0] && graph.Links[0].Link) {
            graph.Links[0].Link.forEach(link => {
                elements.push({
                    data: {
                        id: `${link.$.Source}-${link.$.Target}`,
                        source: link.$.Source,
                        target: link.$.Target,
                        category: link.$.Category
                    }
                });
            });
        }

        return elements;
    }

    public getHtmlContent(graph: DirectedGraph, mode: VisualizerMode): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>${graph.$.Title}</title>
                ${this.getHeadContent()}
            </head>
            <body>
                ${this.getBodyContent(graph, mode)}
            </body>
            </html>
        `;
    }

    public getErrorContent(error: string): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Error</title>
            </head>
            <body>
                <h1>Error</h1>
                <p>${error}</p>
            </body>
            </html>
        `;
    }
}