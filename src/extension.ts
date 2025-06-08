import * as vscode from 'vscode';
import { WebviewContentProvider } from './webviewContent';
import { DebuggerProxy } from './debuggerProxy';
import { DgmlParser } from './dgmlParser';

export function activate(context: vscode.ExtensionContext) {

    console.log('Activating "vscode-nrules-visualizer" extension');

    const disposable = vscode.commands.registerCommand('vscode-nrules-visualizer.showVisualizer', () => {
        const panel = vscode.window.createWebviewPanel(
            'nrulesVisualizer',
            'NRules Visualizer',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
          );

        const contentProvider = new WebviewContentProvider(panel.webview, context.extensionUri);

        var debuggerProxy = new DebuggerProxy();
        debuggerProxy.getContents().then(contents => {

            var parser = new DgmlParser();
            parser.parse(contents).then(result => {

                panel.webview.html = contentProvider.getHtmlContent(result.DirectedGraph);

            }).catch(error => {
                panel.webview.html = contentProvider.getErrorContent(error);
            });

        }).catch(error => {
            panel.webview.html = contentProvider.getErrorContent(error);
        });

        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    vscode.window.showInformationMessage(message.text);
                    return;
            }
        }, undefined, context.subscriptions);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}


