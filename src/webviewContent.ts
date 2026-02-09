import * as vscode from 'vscode';
import { DirectedGraph } from './dgml';

export class WebviewContentProvider {
    constructor(private readonly webview: vscode.Webview, private readonly extensionUri: vscode.Uri) {}

    private getCytoscapePath(): vscode.Uri {
        return this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'node_modules', 'cytoscape', 'dist', 'cytoscape.min.js')
        );
    }

    private getElkPath(): vscode.Uri {
        return this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'node_modules', 'elkjs', 'lib', 'elk.bundled.js')
        );
    }

    private getCytoscapeElkPath(): vscode.Uri {
        return this.webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'node_modules', 'cytoscape-elk', 'dist', 'cytoscape-elk.js')
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
                window.nrGraphStyles = ${JSON.stringify(this.getCytoscapeStyles())};
                window.nrGraphLayout = ${JSON.stringify(this.getCytoscapeLayout())};
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

    private getCytoscapeStyles(): any[] {
        return [
            {
                selector: 'node',
                style: {
                    'shape': 'roundrectangle',
                    'label': 'data(label)',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'color': '#222',
                    'background-color': '#f5f5f5',
                    'border-width': 1,
                    'border-color': '#888',
                    'font-family': 'Segoe UI, Arial, sans-serif',
                    'font-size': '13px',
                    'padding': '8px 16px',
                    'width': 'label',
                    'height': 'label',
                    'min-width': 40,
                    'min-height': 32,
                    'text-wrap': 'wrap',
                    'text-max-width': 200,
                    'text-outline-width': 0,
                    'border-radius': 12
                }
            },
            {
                selector: 'node[category = "Rule"]',
                style: {
                    'background-color': '#a259e6',
                    'border-color': '#7c3fc4'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            }
        ];
    }

    private getCytoscapeLayout(): any {
        return {
            name: 'elk',
            nodeDimensionsIncludeLabels: true,
            elk: {
                algorithm: 'layered',
                'elk.direction': 'DOWN',
                'elk.spacing.nodeNode': 80,
                'elk.layered.spacing.nodeNodeBetweenLayers': 100,
                'elk.edgeRouting': 'ORTHOGONAL'
            },
            fit: true,
            padding: 30,
            animate: false
        };
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