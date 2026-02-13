import * as vscode from 'vscode';
import { DirectedGraph } from './dgml';
import { DgmlStyleResolver } from './dgmlStyleResolver';
import { VisualizerMode } from './visualizerMode';

export class WebviewContentProvider {
    private readonly styleResolver = new DgmlStyleResolver();

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

    private getBodyContent(graph: DirectedGraph): string {
        const scriptPath = this.getScriptPath();
        return `
            <div id="cy"></div>
            <div id="tooltip"></div>
            <script>
                window.nrGraphData = ${JSON.stringify(this.getCytoscapeElements(graph))};
            </script>
            <script src="${scriptPath}"></script>
        `;
    }

    private getCytoscapeElements(graph: DirectedGraph): any[] {
        const elements: any[] = [];
        const { nodeStyles, linkStyles } = this.styleResolver.resolve(graph);

        if (graph.Nodes && graph.Nodes[0] && graph.Nodes[0].Node) {
            graph.Nodes[0].Node.forEach(node => {
                const { Id, Label, Category, ...rest } = node.$;
                const data: any = {
                    id: Id,
                    label: Label || Category || Id,
                    category: Category,
                    properties: { Id, Label, Category, ...rest }
                };
                const computed = nodeStyles.get(Id);
                if (computed) {
                    data.computedStyle = computed;
                }
                elements.push({ data });
            });
        }

        if (graph.Links && graph.Links[0] && graph.Links[0].Link) {
            graph.Links[0].Link.forEach(link => {
                const linkId = `${link.$.Source}-${link.$.Target}`;
                const data: any = {
                    id: linkId,
                    source: link.$.Source,
                    target: link.$.Target,
                    category: link.$.Category
                };
                const computed = linkStyles.get(linkId);
                if (computed) {
                    data.computedStyle = computed;
                }
                elements.push({ data });
            });
        }

        return elements;
    }

    public getHtmlContent(graph: DirectedGraph): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>${graph.$.Title}</title>
                ${this.getHeadContent()}
            </head>
            <body>
                ${this.getBodyContent(graph)}
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